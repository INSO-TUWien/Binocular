'use strict';
import debug from 'debug';

import ctx from '../utils/context.ts';
import ModelCursor from './ModelCursor.js';
import Db from '../core/db/db.ts';
import Model from './Model';
import { Entry as ModelEntry } from './Model';
import { Database } from 'arangojs';
import { Collection, CollectionType } from 'arangojs/collection';

export default class Connection<ConnectionDaoType, FromDaoType, ToDaoType> {
  connections = {};
  fromModel: Model<FromDaoType> | Connection<FromDaoType, unknown, unknown>;
  toModel: Model<ToDaoType> | Connection<ToDaoType, unknown, unknown>;
  collectionName: string;
  log: debug.Debugger;
  db: Db | undefined;
  collection: Collection | undefined;
  rawDb: Database | undefined;
  constructor(
    fromModel: Model<FromDaoType> | Connection<FromDaoType, unknown, unknown>,
    toModel: Model<ToDaoType> | Connection<ToDaoType, unknown, unknown>,
  ) {
    const name = `${fromModel.collectionName}${toModel.collectionName}Connection`;
    this.fromModel = fromModel;
    this.toModel = toModel;
    this.collectionName = `${fromModel.collectionName}-${toModel.collectionName}`;
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

    fromModel.connections[toModel.collectionName] = this;
    toModel.connections[fromModel.collectionName] = this;
  }

  ensureCollection() {
    if (this.db === undefined) {
      throw Error('Database undefined!');
    }
    return this.db.ensureEdgeCollection(this.collectionName, { type: CollectionType.EDGE_COLLECTION });
  }

  async findByIds(fromTo: {
    from: ModelEntry<FromDaoType> | Entry<ConnectionDaoType>;
    to: ModelEntry<ToDaoType> | Entry<ConnectionDaoType>;
  }) {
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

  async ensure(
    data: ConnectionDaoType,
    fromTo: { from: ModelEntry<FromDaoType> | Entry<ConnectionDaoType>; to: ModelEntry<ToDaoType> | Entry<ConnectionDaoType> },
  ) {
    const entry = await this.findByIds(fromTo);
    if (entry) {
      entry.isStored = true;
      return entry;
    } else {
      return this.connect(data, fromTo);
    }
  }

  async store(
    data: ConnectionDaoType,
    fromTo: { from: ModelEntry<FromDaoType> | Entry<ConnectionDaoType>; to: ModelEntry<ToDaoType> | Entry<ConnectionDaoType> },
  ) {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const entry = await this.findByIds(fromTo);
    if (entry) {
      return this.collection.update(entry._key, data as object);
    } else {
      return this.connect(data, fromTo);
    }
  }

  connect(
    data: any,
    fromTo: { from: ModelEntry<FromDaoType> | Entry<ConnectionDaoType>; to: ModelEntry<ToDaoType> | Entry<ConnectionDaoType> },
  ) {
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

    const entry = new Entry(data);
    entry._id = data._id;
    entry._key = data._key;
    entry._from = data._from;
    entry._to = data._to;

    return entry;
  }

  wrapCursor(rawCursor: any) {
    return new ModelCursor(this, rawCursor);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Entry<DaoType> {
  data: DaoType;
  _id: string | undefined;
  _key: string | undefined;
  _from: string | undefined;
  _to: string | undefined;
  constructor(data: DaoType = {} as DaoType) {
    this.data = data;
  }
}
