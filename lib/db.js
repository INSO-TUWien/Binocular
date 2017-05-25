'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const arangojs = require('arangojs');
const log = require('debug')('db');

const ERR_UNKNOWN_COLLECTION = 1203;
const ERR_UNKOWN_GRAPH = 1924;

const ArangoError = function(e) {
  return e.isArangoError && _.includes([ERR_UNKNOWN_COLLECTION, ERR_UNKOWN_GRAPH], e.errorNum);
};

const Db = function(config) {
  this.arango = arangojs(`http://${config.host}:${config.port}`);
  this.arango.useBasicAuth(config.user, config.password);
};

Db.prototype.ensureDatabase = function(name) {
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
  const foxx = require('./foxx');
  return foxx.replace(serviceDirectory, mountPoint);
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
