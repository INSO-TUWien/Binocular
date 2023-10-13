'use strict';

import _ from 'lodash';
import arangojs from 'arangojs';
import * as utils from '../../utils.js';
import { Database } from 'arangojs';
import ctx from '../../context.js';
import debug from 'debug';

const log = debug('db');

const ERR_UNKNOWN_COLLECTION = 1203;
const ERR_UNKOWN_GRAPH = 1924;

const ArangoError = function (e) {
  return e.isArangoError && _.includes([ERR_UNKNOWN_COLLECTION, ERR_UNKOWN_GRAPH], e.errorNum);
};

const Db = function (config) {
  const connectionString = `http://${config.host}:${config.port}`;
  this.arangoServer = new Database(connectionString);
  this.arangoServer.useBasicAuth(config.user, config.password);
  log('DB:', connectionString);
};

Db.prototype.ensureDatabase = function (name) {
  log('Ensuring database', name);
  return Promise.resolve(this.arangoServer.listDatabases())
    .then(
      function (dbs) {
        if (!_.includes(dbs, name)) {
          return this.arangoServer.createDatabase(name);
        }
      }.bind(this)
    )
    .then(
      function () {
        this.arango = this.arangoServer.database(name);
        ctx.emit('ensure:db', this);
        return this.arango;
      }.bind(this)
    );
};

Db.prototype.truncate = function () {
  log('Truncate all collections');
  return Promise.resolve(this.arango.collections()).then((collections) => {
    return Promise.all(collections.map((collection) => Promise.resolve(collection.truncate())));
  });
};

Db.prototype.collections = function () {
  log('Truncate all collections');
  return Promise.resolve(this.arango.collections());
};

Db.prototype.query = async function (q, bindVars) {
  log('Execute the query: ' + q);
  return Promise.resolve(this.arango.query(q, bindVars));
};

Db.prototype.ensureCollection = function () {
  return this.ensure('collection', ...arguments);
};

Db.prototype.ensureEdgeCollection = function () {
  return this.ensure('collection', ...arguments);
};

Db.prototype.ensureGraph = function () {
  return this.ensure('graph', ...arguments);
};

Db.prototype.ensureService = function (serviceDirectory, mountPoint) {
  log('Ensuring service', serviceDirectory, mountPoint);
  return this.arango.listServices().then(
    function (services) {
      const service = _.find(services, (s) => s.mount === mountPoint);

      const stream = utils.createZipStream(serviceDirectory);

      if (service) {
        log(`${mountPoint} already exists, upgrading`);
        return this.arango.upgradeService(mountPoint, stream);
      } else {
        log(`${mountPoint} does not exist, creating`);
        return this.arango.installService(mountPoint, stream);
      }
    }.bind(this)
  );
};

Db.prototype.ensure = function (type, name, ...rest) {
  const collection = this.arango[type](name);

  log('Ensuring %s %o', type, name);

  return Promise.resolve(collection.get())
    .catch(function (e) {
      if (e.name === 'ArangoError') {
        return collection.create(...rest);
      } else {
        throw e;
      }
    })
    .then((collection) => collection);
};

export default Db;
