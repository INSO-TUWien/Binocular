/* eslint-disable no-setter-return */
'use strict';

import _ from 'lodash';
import debug from 'debug';
import * as inflection from 'inflection';

import IllegalArgumentError from '../errors/IllegalArgumentError.js';
import ctx from '../utils/context.ts';
import ModelCursor from './ModelCursor.js';

export default class Model {
  connections = {};

  constructor(name, options) {
    options = _.defaults({}, options, { attributes: [], keyAttribute: '_key' });
    this.attributes = options.attributes;
    this.collectionName = name;

    this.collectionName = inflection.pluralize(_.lowerFirst(name));
    this.log = debug(`db:${name}`);

    ctx.on(
      'ensure:db',
      function (db) {
        this.db = db;
        this.rawDb = db.arango;
        this.collection = db.arango.collection(this.collectionName);
      }.bind(this),
    );
  }

  ensureCollection() {
    return this.db.ensureCollection(this.collectionName);
  }

  async firstExample(data) {
    this.log('firstExample %o', data);
    let d;
    try {
      d = await Promise.resolve(this.collection.firstExample(data));
    } catch (e) {
      d = null;
    }
    return this.parse(d);
  }

  async findById(id) {
    this.log('findById %o', id);
    const docs = await Promise.resolve(this.collection.lookupByKeys([id.toString()]));
    if (docs.length > 0) {
      return Entry.parse(docs[0]);
    }
    return null;
  }

  async ensureById(id, data) {
    return this.findOneById(id).then(
      function (resp) {
        if (resp) {
          return [this.parse(resp), false];
        } else {
          const entry = new Entry(data, this, {
            attributes: this.attributes,
            isNew: true,
            ignoreUnknownAttributes: true,
          });
          entry.id = id;

          return this.save(entry).then((i) => [i, true]);
        }
      }.bind(this),
    );
  }

  findOneById(id) {
    this.log('findById %o', id);
    return this.firstExample({ id: id });
  }

  async ensureBy(key, value, data, options) {
    data[key] = value;
    return this.findOneBy(key, value).then(
      function (resp) {
        if (resp) {
          return [this.parse(resp.data), false];
        } else {
          const entry = new Entry(data, this, {
            attributes: this.attributes,
            isNew: options ? options.isNew : true,
            ignoreUnknownAttributes: true,
          });
          return this.save(entry).then((i) => [i, true]);
        }
      }.bind(this),
    );
  }

  findOneBy(key, value) {
    this.log(`findBy${key} ${value}`);
    return this.firstExample({ [key]: value });
  }

  create(data, options) {
    const entry = new Entry(data, this, {
      attributes: this.attributes,
      isNew: options ? options.isNew : true,
      ignoreUnknownAttributes: true,
    });
    return this.save(entry);
  }

  bulkCreate(datas) {
    this.log('bulkCreate %o items', datas.length);
    return this.collection.import(datas).then(function () {
      return datas.map((data) => this.parse(data));
    });
  }

  ensure(data) {
    return this.findOneBy('_key', this._key).then((instance) => {
      if (instance) {
        instance.isStored = true;
        return instance;
      } else {
        return this.save(
          new Entry(data, this, {
            attributes: this.attributes,
            isNew: false,
            ignoreUnknownAttributes: true,
          }),
        );
      }
    });
  }

  parse(data) {
    if (data === null) {
      return null;
    }

    const entry = new Entry(data, this, {
      attributes: this.attributes,
      isNew: false,
      ignoreUnknownAttributes: true,
    });
    entry._id = data._id;
    entry._key = data._key;

    return entry;
  }

  wrapCursor(rawCursor) {
    return new ModelCursor(Model, rawCursor);
  }

  cursor(query) {
    if (!query) {
      return Promise.resolve(this.collection.all()).then((rawCursor) => this.wrapCursor(rawCursor));
    } else {
      return Promise.resolve(this.rawDb.query(query)).then((rawCursor) => this.wrapCursor(rawCursor));
    }
  }

  async findAll() {
    const cursor1 = await Promise.resolve(this.collection.all());
    const ds = await cursor1.all();
    return ds.map((d) => this.parse(d));
  }

  save(entry) {
    this.log('save %o', entry.data);

    if (entry.isNew) {
      entry.justCreated = true;
      return Promise.resolve(this.collection.save(_.defaults({ _key: entry._key }, entry.data)))
        .catch(() => {
          entry.justCreated = false;
          entry.justUpdated = false;
          return this.ensure();
        })
        .then(function (resp) {
          entry._key = resp._key;
          entry._id = resp._id;
          entry.isNew = false;

          return entry;
        });
    } else {
      entry.justUpdated = true;
      return Promise.resolve(this.collection.update({ _key: entry._key }, entry.data))
        .catch(() => {
          entry.justCreated = false;
          entry.justUpdated = false;
          return this.ensure();
        })
        .then(function (resp) {
          entry._key = resp._key;
          entry._id = resp._id;
          entry.isNew = false;

          return entry;
        });
    }
  }

  connect(from, to, data) {
    return connectionHandling.bind(this)(from, to, data, (ConnectionClass, data, fromTo) => ConnectionClass.create(data, fromTo));
  }

  ensureConnection(from, to, data) {
    return connectionHandling.bind(this)(from, to, data, (ConnectionClass, data, fromTo) => ConnectionClass.ensure(data, fromTo));
  }

  storeConnection(from, to, data) {
    return connectionHandling.bind(this)(from, to, data, (ConnectionClass, data, fromTo) => ConnectionClass.store(data, fromTo));
  }
}

class Entry {
  constructor(data, model, options) {
    this.data = _.defaults({}, data);
    options = _.defaults({}, options, { isNew: true, ignoreUnknownAttributes: false });

    this.isNew = options.isNew;
    this.log = debug(`db:${model.collectionName}`);
    this.model = model;
    _.each(
      _.keys(data),
      function (key) {
        if (!_.includes(options.attributes, key)) {
          this.log(`${key} is not a valid data property for collection ${model.collectionName}`);

          if (!options.ignoreUnknownAttributes) {
            throw new IllegalArgumentError(`${key} is not a valid data property for collection ${model.collectionName}`);
          }
        }
      }.bind(this),
    );
  }
}

function connectionHandling(fromEntry, toEntry, data, cb) {
  if (!(toEntry instanceof Entry)) {
    throw new IllegalArgumentError('${target} is not an instance of Model');
  }

  const ConnectionClass = fromEntry.model.connections[toEntry.model.collectionName];

  if (!ConnectionClass) {
    throw new IllegalArgumentError(`${fromEntry.model.collectionName} is not connected to ${toEntry.model.collectionName}`);
  }

  let from, to;

  if (ConnectionClass.fromModel === fromEntry.model) {
    from = fromEntry;
    to = toEntry;
  } else {
    from = toEntry;
    to = fromEntry;
  }

  return cb(ConnectionClass, data, { from: from, to: to });
}
