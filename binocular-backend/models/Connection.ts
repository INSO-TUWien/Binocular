'use strict';
import debug from 'debug';

import ctx from '../utils/context.ts';
import * as collection from 'arangojs/collection.js';
import ModelCursor from './ModelCursor.js';
import _ from 'lodash';
import Db from '../core/db/db.ts';
import { Collection } from 'arangojs/collection.js';
import Model from './Model';
import { Entry as ModelEntry } from './Model';
import { Database } from 'arangojs';

export default class Connection {
  connections = {};
  FromModel: Model;
  ToModel: Model;
  attributes: string[];
  collectionName: string;
  log: debug.Debugger;
  db: Db | undefined;
  collection: Collection | undefined;
  rawDb: Database | undefined;
  constructor(FromModel: Model, ToModel: Model, options: { attributes: string[] }) {
    options = _.defaults({}, options, { attributes: [] });
    const name = `${FromModel.collectionName}${ToModel.collectionName}Connection`;
    this.FromModel = FromModel;
    this.ToModel = ToModel;
    this.attributes = options.attributes;
    this.collectionName = `${FromModel.collectionName}-${ToModel.collectionName}`;
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

    FromModel.connections[ToModel.collectionName] = this;
    ToModel.connections[FromModel.collectionName] = this;
  }

  ensureCollection() {
    if (this.db === undefined) {
      throw Error('Database undefined!');
    }
    return this.db.ensureEdgeCollection(this.collectionName, { type: collection.CollectionType.EDGE_COLLECTION });
  }

  async findByIds(fromTo: { from: ModelEntry; to: ModelEntry }) {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const keys = { _from: fromTo.from._id, _to: fromTo.to._id };
    try {
      return await Promise.resolve(this.collection.firstExample(keys));
    } catch (err: any) {
      if (err.code === 404) {
        return null;
      }
    }
  }

  async ensure(data: any, fromTo: { from: ModelEntry; to: ModelEntry }) {
    const entry = await this.findByIds(fromTo);
    if (entry) {
      entry.isStored = true;
      return entry;
    } else {
      return this.create(data, fromTo);
    }
  }

  async store(data: any, fromTo: { from: ModelEntry; to: ModelEntry }) {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const entry = await this.findByIds(fromTo);
    if (entry) {
      return this.collection.update(entry._key, data);
    } else {
      return this.create(data, fromTo);
    }
  }

  create(data: any, fromTo: { from: ModelEntry; to: ModelEntry }) {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    this.log('connect %o %o', { from: fromTo.from._id, to: fromTo.to._id }, data);
    data = data || {};
    data._from = fromTo.from._id;
    data._to = fromTo.to._id;
    return Promise.resolve(this.collection.save(data));
  }

  parse(data: any) {
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

  wrapCursor(rawCursor: any) {
    return new ModelCursor(Connection, rawCursor);
  }

  async findAll() {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const cursor = await Promise.resolve(this.collection.all());
    const ds = await cursor.all();
    return ds.map((d) => this.parse(d));
  }
}

class Entry {
  data: any;
  _id: string | undefined;
  _key: string | undefined;
  _from: string | undefined;
  _to: string | undefined;
  constructor(data = {}) {
    this.data = data;
  }
}
