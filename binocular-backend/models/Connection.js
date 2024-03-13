'use strict';
import debug from 'debug';

import ctx from '../utils/context.ts';
import * as collection from 'arangojs/collection.js';
import ModelCursor from './ModelCursor.js';
import _ from 'lodash';

export default class Connection {
  connections = {};
  constructor(FromModel, ToModel, options) {
    options = _.defaults({}, options, { attributes: [] });
    const name = `${FromModel.collectionName}${ToModel.collectionName}Connection`;
    this.FromModel = FromModel;
    this.ToModel = ToModel;
    this.attributes = options.attributes;
    this.collectionName = `${FromModel.collectionName}-${ToModel.collectionName}`;
    this.log = debug(`db:${name}`);

    ctx.on(
      'ensure:db',
      function (db) {
        this.db = db;
        this.rawDb = db.arango;
        this.collection = db.arango.collection(this.collectionName);
      }.bind(this),
    );

    FromModel.connections[ToModel.collectionName] = this;
    ToModel.connections[FromModel.collectionName] = this;
  }

  ensureCollection() {
    return this.db.ensureEdgeCollection(this.collectionName, { type: collection.CollectionType.EDGE_COLLECTION });
  }

  async findByIds(fromTo) {
    const keys = { _from: fromTo.from._id, _to: fromTo.to._id };
    try {
      return await Promise.resolve(this.collection.firstExample(keys));
    } catch (err) {
      if (err.code === 404) {
        return null;
      }
    }
  }

  async ensure(data, fromTo) {
    const entry = await this.findByIds(fromTo);
    if (entry) {
      entry.isStored = true;
      return entry;
    } else {
      return this.create(data, fromTo);
    }
  }

  async store(data, fromTo) {
    const entry = await this.findByIds(fromTo);
    if (entry) {
      return this.collection.update(entry._key, data);
    } else {
      return this.create(data, fromTo);
    }
  }

  create(data, fromTo) {
    this.log('connect %o %o', { from: fromTo.from._id, to: fromTo.to._id }, data);
    data = data || {};
    data._from = fromTo.from._id;
    data._to = fromTo.to._id;
    return Promise.resolve(this.collection.save(data));
  }

  parse(data) {
    if (data === null) {
      return null;
    }

    const entry = new Entry(_.pick(data, ...this.attributes));
    entry._id = data._id;
    entry._key = data._key;
    entry._from = data._from;
    entry._to = data._to;

    return entry;
  }

  wrapCursor(rawCursor) {
    return new ModelCursor(Connection, rawCursor);
  }

  async findAll() {
    const cursor = await Promise.resolve(this.collection.all());
    const ds = await cursor.all();
    return ds.map((d) => this.parse(d));
  }
}

class Entry {
  constructor(data = {}) {
    this.data = data;
  }
}
