'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const arangojs = require('arangojs');
const log = require('debug')('db');
const utils = require('./utils.js');

const ERR_UNKNOWN_COLLECTION = 1203;
const ERR_UNKOWN_GRAPH = 1924;

const ArangoError = function(e) {
  return e.isArangoError && _.includes([ERR_UNKNOWN_COLLECTION, ERR_UNKOWN_GRAPH], e.errorNum);
};

const Db = function(config) {
  const connectionString = `http://${config.host}:${config.port}`;
  this.arango = arangojs(connectionString);
  this.arango.useBasicAuth(config.user, config.password);
  log('DB:', connectionString);
};

Db.prototype.ensureDatabase = function(name) {
  log('Ensuring database', name);
  return Promise.resolve(this.arango.listDatabases())
    .bind(this)
    .then(function(dbs) {
      if (!_.includes(dbs, name)) {
        return this.arango.createDatabase(name);
      }
    })
    .tap(function() {
      this.arango.useDatabase(name);
    });
};

Db.prototype.truncate = function() {
  log('Truncate all collections');
  return Promise.resolve(this.arango.truncate());
};

Db.prototype.ensureCollection = function() {
  return this.ensure('collection', ...arguments);
};

Db.prototype.ensureEdgeCollection = function() {
  return this.ensure('edgeCollection', ...arguments);
};

Db.prototype.ensureGraph = function() {
  return this.ensure('graph', ...arguments);
};

Db.prototype.ensureService = function(serviceDirectory, mountPoint) {
  log('Ensuring service', serviceDirectory, mountPoint);
  return this.arango.listServices().then(services => {
    const service = _.find(services, s => s.mount === mountPoint);

    const stream = utils.createZipStream(serviceDirectory);

    if (service) {
      log(`${mountPoint} already exists, upgrading`);
      return this.arango.upgradeService(mountPoint, stream);
    } else {
      log(`${mountPoint} does not exist, creating`);
      return this.arango.installService(mountPoint, stream);
    }
  });
};

Db.prototype.ensure = function(type, name, ...rest) {
  const collection = this.arango[type](name);

  log('Ensuring %s %o', type, name);

  return Promise.resolve(collection.get())
    .catch(function(e) {
      throw e;
    })
    .catch(ArangoError, function() {
      return collection.create(...rest);
    })
    .thenReturn(collection);
};

module.exports = Db;
