'use strict';
import debug from 'debug';

import ctx from '../utils/context.ts';
import * as collection from 'arangojs/collection.js';
import ModelCursor from './ModelCursor.js';
import _ from 'lodash';

class Connection {}

Connection.define = function (FromModel, ToModel, attributes = []) {
  const name = `${FromModel.collectionName}${ToModel.collectionName}Connection`;

  const ConnectionClass = class extends Connection {
    constructor(data = {}) {
      super(arguments);
      this.data = data;
    }

    static get name() {
      return name;
    }

    static ensureCollection() {
      return this.db.ensureEdgeCollection(this.collectionName, { type: collection.CollectionType.EDGE_COLLECTION });
    }

    static findByIds(fromTo) {
      const keys = { _from: fromTo.from._id, _to: fromTo.to._id };
      return Promise.resolve(ConnectionClass.collection.firstExample(keys)).catch((err) => {
        if (err.code === 404) {
          return null;
        }
      });
    }

    static ensure(data, fromTo) {
      return ConnectionClass.findByIds(fromTo).then((instance) => {
        if (instance) {
          instance.isStored = true;
          return instance;
        } else {
          return this.create(data, fromTo);
        }
      });
    }

    static store(data, fromTo) {
      return ConnectionClass.findByIds(fromTo).then((instance) => {
        if (instance) {
          return ConnectionClass.collection.update(instance._key, data);
        } else {
          return this.create(data, fromTo);
        }
      });
    }

    static create(data, fromTo) {
      this.log('connect %o %o', { from: fromTo.from._id, to: fromTo.to._id }, data);
      data = data || {};
      data._from = fromTo.from._id;
      data._to = fromTo.to._id;
      return Promise.resolve(this.collection.save(data));
    }

    static parse(data) {
      if (data === null) {
        return null;
      }

      const instance = new ConnectionClass(_.pick(data, ...attributes));
      instance._id = data._id;
      instance._key = data._key;
      instance._from = data._from;
      instance._to = data._to;

      return instance;
    }

    static wrapCursor(rawCursor) {
      return new ModelCursor(ConnectionClass, rawCursor);
    }

    static findAll() {
      return Promise.resolve(ConnectionClass.collection.all())
        .then((cursor) => cursor.all())
        .then((ds) => ds.map((d) => ConnectionClass.parse(d)));
    }
  };

  ConnectionClass.connections = {};
  ConnectionClass.FromModel = FromModel;
  ConnectionClass.ToModel = ToModel;
  ConnectionClass.collectionName = `${FromModel.collectionName}-${ToModel.collectionName}`;

  ctx.on('ensure:db', function (db) {
    ConnectionClass.db = db;
    ConnectionClass.rawDb = db.arango;
    ConnectionClass.log = debug(`db:${name}`);
    ConnectionClass.collection = db.arango.collection(ConnectionClass.collectionName);
  });

  FromModel.connections[ToModel.collectionName] = ConnectionClass;
  ToModel.connections[FromModel.collectionName] = ConnectionClass;

  return ConnectionClass;
};

export default Connection;
