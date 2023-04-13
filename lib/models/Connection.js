'use strict';
const debug = require('debug');

const ctx = require('../context.js');
const collection = require('arangojs/collection');

function Connection() {}

Connection.define = function (FromModel, ToModel) {
  const name = `${FromModel.name}${ToModel.name}Connection`;

  const ConnectionClass = class extends Connection {
    constructor() {
      super(arguments);
    }

    static get name() {
      return name;
    }

    static ensureCollection() {
      return this.db.ensureEdgeCollection(this.collectionName, { type: collection.CollectionType.EDGE_COLLECTION });
    }

    static findByIds(fromTo) {
      const keys = { _from: fromTo.from._id, _to: fromTo.to._id };
      try {
        return Promise.resolve(ConnectionClass.collection.firstExample(keys));
      } catch (e) {
        return null;
      }
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
  };

  ConnectionClass.FromModel = FromModel;
  ConnectionClass.ToModel = ToModel;
  ConnectionClass.collectionName = `${FromModel.collectionName}-${ToModel.collectionName}`;

  ctx.on('ensure:db', function (db) {
    ConnectionClass.db = db;
    ConnectionClass.rawDb = db.arango;
    ConnectionClass.log = debug(`db:${name}`);
    ConnectionClass.collection = db.arango.collection(ConnectionClass.collectionName);
  });

  FromModel.connections[ToModel.name] = ConnectionClass;
  ToModel.connections[FromModel.name] = ConnectionClass;

  return ConnectionClass;
};

module.exports = Connection;
