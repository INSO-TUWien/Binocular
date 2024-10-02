'use strict';
import debug from 'debug';

import ctx from '../utils/context';
import ModelCursor from './ModelCursor';
import Db from '../core/db/db';
import Model from './Model';
import { Entry as ModelEntry } from './Model';
import { Database } from 'arangojs';
import { Collection, CollectionType, DocumentCollection, EdgeCollection } from 'arangojs/collection';

export default class Connection<ConnectionDataType, FromDataType, ToDataType> {
  connections = {};
  collectionName: string | undefined;
  log = debug('db:unnamedConnection');
  db: Db | undefined;
  collection: (DocumentCollection<any> & EdgeCollection<any>) | undefined;
  rawDb: Database | undefined;
  constructor() {
    ctx.on('ensure:db', (db: Db) => {
      if (db.arango !== undefined) {
        //ensure db
        this.db = db;
        this.rawDb = db.arango;
      }
    });
  }

  ensureCollection(
    fromModel: Model<FromDataType> | Connection<FromDataType, unknown, unknown>,
    toModel: Model<ToDataType> | Connection<ToDataType, unknown, unknown>,
  ): Promise<Collection> | undefined {
    if (this.db === undefined) {
      throw Error('Database undefined!');
    }
    if (this.rawDb === undefined) {
      throw Error('Model rawDb undefined!');
    }
    if (fromModel.collectionName === undefined) {
      throw Error('From model collection name undefined!');
    }
    if (toModel.collectionName === undefined) {
      throw Error('To model collection name undefined!');
    }
    //configure Collection
    const name = `${fromModel.collectionName}${toModel.collectionName}Connection`;
    this.collectionName = `${fromModel.collectionName}-${toModel.collectionName}`;
    this.log = debug(`db:${name}`);
    fromModel.connections[toModel.collectionName] = this;
    toModel.connections[fromModel.collectionName] = this;

    //ensure Collection
    this.collection = this.rawDb.collection(this.collectionName);
    return this.db.ensureEdgeCollection(this.collectionName, { type: CollectionType.EDGE_COLLECTION });
  }

  /**
   * finds the first example of a connection between two objects.
   */
  async findByIds(fromTo: {
    from: ModelEntry<FromDataType> | Entry<ConnectionDataType>;
    to: ModelEntry<ToDataType> | Entry<ConnectionDataType>;
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

  /**
   * finds the first example of a connection between two objects where the data of the connection matches.
   */
  async findByIdsAndData(
    fromTo: {
      from: ModelEntry<FromDataType> | Entry<ConnectionDataType>;
      to: ModelEntry<ToDataType> | Entry<ConnectionDataType>;
    },
    data: ConnectionDataType,
  ) {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const keys = { _from: fromTo.from._id, _to: fromTo.to._id };
    for (const [key, value] of Object.entries(data as object)) {
      keys[key] = value;
    }
    try {
      return await Promise.resolve(this.collection.firstExample(keys));
    } catch (err: any) {
      if (err.code === 404) {
        return null;
      }
    }
  }

  /**
   * ensures that a connection between A and B exists.
   * Note: only checks if there is *some* connection between A and B, not if there is a connection between A and B with data `data`.
   */
  async ensure(
    data: ConnectionDataType,
    fromTo: { from: ModelEntry<FromDataType> | Entry<ConnectionDataType>; to: ModelEntry<ToDataType> | Entry<ConnectionDataType> },
  ) {
    const entry = await this.findByIds(fromTo);
    if (entry) {
      entry.isStored = true;
      return entry;
    } else {
      return this.connect(data, fromTo);
    }
  }

  /**
   * ensures that a connection between A and B exists with the provided data.
   * Note: If there already exists a connection between A and B but the connection data does not match, a second connection is stored.
   */
  async ensureWithData(
    data: ConnectionDataType,
    fromTo: { from: ModelEntry<FromDataType> | Entry<ConnectionDataType>; to: ModelEntry<ToDataType> | Entry<ConnectionDataType> },
  ) {
    const entry = await this.findByIdsAndData(fromTo, data);
    if (entry) {
      entry.isStored = true;
      return entry;
    } else {
      return this.connect(data, fromTo);
    }
  }

  async store(
    data: ConnectionDataType,
    fromTo: { from: ModelEntry<FromDataType> | Entry<ConnectionDataType>; to: ModelEntry<ToDataType> | Entry<ConnectionDataType> },
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
    fromTo: { from: ModelEntry<FromDataType> | Entry<ConnectionDataType>; to: ModelEntry<ToDataType> | Entry<ConnectionDataType> },
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

  parse(data: ConnectionDataType & { _id: string; _key: string; _from: string; _to: string }): Entry<ConnectionDataType> | null {
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

  async findAll(): Promise<(Entry<ConnectionDataType> | null)[]> {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const cursor = await Promise.resolve(this.collection.all());
    const ds = await cursor.all();
    return ds.map((d) => this.parse(d));
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Entry<DataType> {
  data: DataType;
  _id: string | undefined;
  _key: string | undefined;
  _from: string | undefined;
  _to: string | undefined;
  constructor(data: DataType = {} as DataType) {
    this.data = data;
  }
}
