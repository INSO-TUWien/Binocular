/* eslint-disable no-setter-return */
'use strict';

import _ from 'lodash';
import debug from 'debug';
import * as inflection from 'inflection';

import IllegalArgumentError from '../errors/IllegalArgumentError.js';
import ctx from '../utils/context.ts';
import ModelCursor from './ModelCursor.js';
import Db from '../core/db/db.ts';
import { Collection } from 'arangojs/collection';
import { Database } from 'arangojs';
import Connection from './Connection.ts';
import { AqlQuery } from 'arangojs/aql';

export default class Model {
  connections = {};
  attributes: string[];
  collectionName: string;
  log: debug.Debugger;
  db: Db | undefined;
  collection: Collection | undefined;
  rawDb: Database | undefined;

  constructor(name, options) {
    options = _.defaults({}, options, { attributes: [], keyAttribute: '_key' });
    this.attributes = options.attributes;
    this.collectionName = name;

    this.collectionName = inflection.pluralize(_.lowerFirst(name));
    this.log = debug(`db:${name}`);

    ctx.on(
      'ensure:db',
      function (db: Db) {
        if (db.arango !== undefined) {
          this.db = db;
          this.rawDb = db.arango;
          this.collection = db.arango.collection(this.collectionName);
        }
      }.bind(this),
    );
  }

  ensureCollection() {
    if (this.db === undefined) {
      throw Error('Database undefined!');
    }
    return this.db.ensureCollection(this.collectionName);
  }

  async firstExample(data: any) {
    this.log('firstExample %o', data);
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    let d;
    try {
      d = await Promise.resolve(this.collection.firstExample(data));
    } catch (e) {
      d = null;
    }
    return this.parse(d);
  }

  async findById(id: string) {
    this.log('findById %o', id);
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const docs = await Promise.resolve(this.collection.lookupByKeys([id.toString()]));
    if (docs.length > 0) {
      return this.parse(docs[0]);
    }
    return null;
  }

  async ensureById(id: string, data: any, options?: { ignoreUnknownAttributes?: boolean; isNew?: boolean }) {
    return this.findOneById(id).then(
      function (resp) {
        if (resp) {
          return [this.parse(resp), false];
        } else {
          const entry = new Entry(data, this, {
            attributes: this.attributes,
            isNew: options && options.isNew ? options.isNew : true,
            ignoreUnknownAttributes: options && options.ignoreUnknownAttributes ? options.ignoreUnknownAttributes : true,
          });
          entry._id = id;

          return this.save(entry).then((i) => [i, true]);
        }
      }.bind(this),
    );
  }

  findOneById(id: string) {
    this.log('findById %o', id);
    return this.firstExample({ id: id });
  }

  async ensureBy(key: string, value: any, data: any, options?: { ignoreUnknownAttributes?: boolean; isNew?: boolean }) {
    data[key] = value;
    return this.findOneBy(key, value).then(
      function (resp) {
        if (resp) {
          return [this.parse(resp.data), false];
        } else {
          const entry = new Entry(data, this, {
            attributes: this.attributes,
            isNew: options && options.isNew ? options.isNew : true,
            ignoreUnknownAttributes: options && options.ignoreUnknownAttributes ? options.ignoreUnknownAttributes : true,
          });
          return this.save(entry).then((i) => [i, true]);
        }
      }.bind(this),
    );
  }

  findOneBy(key: string, value: any) {
    this.log(`findBy${key} ${value}`);
    return this.firstExample({ [key]: value });
  }

  create(data: any, options?: { isNew: boolean }) {
    const entry = new Entry(data, this, {
      attributes: this.attributes,
      isNew: options ? options.isNew : true,
      ignoreUnknownAttributes: true,
    });
    return this.save(entry);
  }

  bulkCreate(datas: any[]) {
    this.log('bulkCreate %o items', datas.length);
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    return this.collection.import(datas).then(() => {
      return datas.map((data) => this.parse(data));
    });
  }

  ensure(entry: Entry) {
    return this.findOneBy('_key', entry._key).then((instance) => {
      if (instance) {
        instance.isStored = true;
        return instance;
      } else {
        return this.save(
          new Entry(entry.data, this, {
            attributes: this.attributes,
            isNew: false,
            ignoreUnknownAttributes: true,
          }),
        );
      }
    });
  }

  parse(data: any) {
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

  wrapCursor(rawCursor: any) {
    return new ModelCursor(this, rawCursor);
  }

  async cursor(query: AqlQuery) {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    if (this.rawDb === undefined) {
      throw Error('RawDb undefined!');
    }
    if (!query) {
      const rawCursor = await Promise.resolve(this.collection.all());
      return this.wrapCursor(rawCursor);
    } else {
      const rawCursor_2 = await Promise.resolve(this.rawDb.query(query));
      return this.wrapCursor(rawCursor_2);
    }
  }

  async findAll() {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const cursor1 = await Promise.resolve(this.collection.all());
    const ds = await cursor1.all();
    return ds.map((d) => this.parse(d));
  }

  save(entry: Entry) {
    this.log('save %o', entry.data);
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    if (entry.isNew) {
      entry.justCreated = true;
      return Promise.resolve(this.collection.save(_.defaults({ _key: entry._key }, entry.data)))
        .catch(() => {
          entry.justCreated = false;
          entry.justUpdated = false;
          return this.ensure(entry);
        })
        .then(function (resp) {
          entry._key = resp._key;
          entry._id = resp._id;
          entry.isNew = false;

          return entry;
        });
    } else {
      entry.justUpdated = true;
      return Promise.resolve(this.collection.update({ _id: entry._id, _key: entry._key === undefined ? '' : entry._key }, entry.data))
        .catch(() => {
          entry.justCreated = false;
          entry.justUpdated = false;
          return this.ensure(entry);
        })
        .then(function (resp) {
          entry._key = resp._key;
          entry._id = resp._id;
          entry.isNew = false;

          return entry;
        });
    }
  }

  connect(from: Entry, to: Entry, data?: any) {
    return connectionHandling.bind(this)(from, to, data, (ConnectionClass, data, fromTo) => ConnectionClass.create(data, fromTo));
  }

  ensureConnection(from: Entry, to: Entry, data?: any) {
    return connectionHandling.bind(this)(from, to, data, (ConnectionClass, data, fromTo) => ConnectionClass.ensure(data, fromTo));
  }

  storeConnection(from: Entry, to: Entry, data?: any) {
    return connectionHandling.bind(this)(from, to, data, (ConnectionClass, data, fromTo) => ConnectionClass.store(data, fromTo));
  }
}

export class Entry {
  data: any;
  _id: string | undefined;
  _key: string | undefined;
  isStored: boolean | undefined;
  isNew: boolean;
  log: debug.Debugger;
  model: Model;
  justCreated: boolean | undefined;
  justUpdated: boolean | undefined;
  constructor(data: any, model: Model, options: { attributes: string[]; isNew: boolean; ignoreUnknownAttributes: boolean }) {
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

function connectionHandling(
  fromEntry: Entry,
  toEntry: Entry,
  data: any,
  cb: (connection: Connection, data: any, entries: { from: Entry; to: Entry }) => any,
) {
  const ConnectionClass = fromEntry.model.connections[toEntry.model.collectionName];

  if (!ConnectionClass) {
    throw new IllegalArgumentError(`${fromEntry.model.collectionName} is not connected to ${toEntry.model.collectionName}`);
  }

  let from: Entry;
  let to: Entry;

  if (ConnectionClass.fromModel === fromEntry.model) {
    from = fromEntry;
    to = toEntry;
  } else {
    from = toEntry;
    to = fromEntry;
  }

  return cb(ConnectionClass, data, { from: from, to: to });
}
