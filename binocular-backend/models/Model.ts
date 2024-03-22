/* eslint-disable no-setter-return */
'use strict';

import _ from 'lodash';
import debug from 'debug';
import * as inflection from 'inflection';

import ctx from '../utils/context';
import ModelCursor from './ModelCursor';
import Db from '../core/db/db';
import { Collection, DocumentCollection, EdgeCollection } from 'arangojs/collection';
import { Database } from 'arangojs';
import { AqlQuery } from 'arangojs/aql';

export default class Model<DataType> {
  connections = {};
  collectionName: string;
  log: debug.Debugger;
  db: Db | undefined;
  collection: (DocumentCollection<any> & EdgeCollection<any>) | undefined;
  rawDb: Database | undefined;

  constructor(options: { name: string; keyAttribute?: string }) {
    options = _.defaults({}, options, { keyAttribute: '_key' });
    this.collectionName = options.name;

    this.collectionName = inflection.pluralize(_.lowerFirst(options.name));
    this.log = debug(`db:${options.name}`);

    ctx.on(
      'ensure:db',
      function (db: Db) {
        if (db.arango !== undefined) {
          this.db = db;
          this.rawDb = db.arango;
        }
      }.bind(this),
    );
  }

  ensureCollection(): Promise<Collection> | undefined {
    if (this.db === undefined) {
      throw Error('Database undefined!');
    }
    if (this.rawDb === undefined) {
      throw Error('Model rawDb undefined!');
    }
    this.collection = this.rawDb.collection(this.collectionName);
    return this.db.ensureCollection(this.collectionName);
  }

  async firstExample(data: DataType & { _id?: string; _key?: string }): Promise<Entry<DataType> | null> {
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

  async findById(id: string): Promise<Entry<DataType> | null> {
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

  async ensureById(id: string, data: DataType, options?: { isNew?: boolean }) {
    return this.findOneById(id).then(
      function (resp) {
        if (resp) {
          return [this.parse(resp), false];
        } else {
          const entry = new Entry<DataType>(data, {
            isNew: options && options.isNew ? options.isNew : true,
          });
          entry._id = id;

          return this.save(entry).then((i) => [i, true]);
        }
      }.bind(this),
    );
  }

  findOneById(id: string): Promise<Entry<DataType> | null> {
    this.log('findById %o', id);
    return this.firstExample({ _id: id } as DataType & { _id: string; _key: string });
  }

  async ensureBy(key: string, value: string | boolean | number | undefined, data: DataType, options?: { isNew?: boolean }) {
    data[key] = value;
    return this.findOneBy(key, value).then(
      function (resp) {
        if (resp) {
          return [this.parse(resp.data), false];
        } else {
          const entry = new Entry<DataType>(data, {
            isNew: options && options.isNew ? options.isNew : true,
          });
          return this.save(entry).then((i) => [i, true]);
        }
      }.bind(this),
    );
  }

  findOneBy(key: string, value: string | boolean | number | undefined): Promise<Entry<DataType> | null> {
    this.log(`findBy${key} ${value}`);
    return this.firstExample({ [key]: value } as DataType & { _id: string; _key: string });
  }

  create(data: DataType, options?: { isNew: boolean }): Promise<Entry<DataType>> {
    const entry = new Entry<DataType>(data, {
      isNew: options ? options.isNew : true,
    });
    return this.save(entry);
  }

  bulkCreate(datas: (DataType & { _id: string; _key: string })[]) {
    this.log('bulkCreate %o items', datas.length);
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    return this.collection.import(datas).then(() => {
      return datas.map((data) => this.parse(data));
    });
  }

  async ensure(entry: Entry<DataType>): Promise<Entry<DataType>> {
    const instance = await this.findOneBy('_key', entry._key);
    if (instance) {
      instance.isStored = true;
      return instance;
    } else {
      return this.save(
        new Entry<DataType>(entry.data, {
          isNew: false,
        }),
      );
    }
  }

  parse(data: DataType & { _id: string; _key: string }): Entry<DataType> | null {
    if (data === null) {
      return null;
    }

    const entry = new Entry<DataType>(data, {
      isNew: false,
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

  async findAll(): Promise<(Entry<DataType> | null)[]> {
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    const cursor1 = await Promise.resolve(this.collection.all());
    const ds = await cursor1.all();
    return ds.map((d: DataType & { _id: string; _key: string }) => this.parse(d));
  }

  async save(entry: Entry<DataType>): Promise<Entry<DataType>> {
    this.log('save %o', entry.data);
    if (this.collection === undefined) {
      throw Error('Collection undefined!');
    }
    let resp: any;

    if (entry.isNew) {
      entry.justCreated = true;
      try {
        resp = await Promise.resolve(this.collection.save(_.defaults({ _key: entry._key }, entry.data)));
      } catch {
        entry.justCreated = false;
        entry.justUpdated = false;
        resp = await this.ensure(entry);
      }
      entry._key = resp._key;
      entry._id = resp._id;
      entry.isNew = false;
      return entry;
    } else {
      entry.justUpdated = true;
      try {
        resp = await Promise.resolve(
          this.collection.update(
            {
              _id: entry._id,
              _key: entry._key === undefined ? '' : entry._key,
            },
            entry.data as object,
          ),
        );
      } catch {
        entry.justCreated = false;
        entry.justUpdated = false;
        resp = await this.ensure(entry);
      }
      entry._key = resp._key;
      entry._id = resp._id;
      entry.isNew = false;
      return entry;
    }
  }
}

export class Entry<DataType> {
  data: DataType;
  _id: string | undefined;
  _key: string | undefined;
  isStored: boolean | undefined;
  isNew: boolean | undefined;
  justCreated: boolean | undefined;
  justUpdated: boolean | undefined;
  constructor(data: DataType, options: { isNew?: boolean }) {
    this.data = _.defaults({}, data);
    options = _.defaults({}, options, { isNew: true });

    this.isNew = options.isNew;
  }
}
