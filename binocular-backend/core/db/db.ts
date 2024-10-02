'use strict';

import _ from 'lodash';
import * as utils from '../../utils/utils.ts';
import { Database } from 'arangojs';
import debug from 'debug';
import { Collection, DocumentCollection, EdgeCollection } from 'arangojs/collection';

const log = debug('db');

class Db {
  arangoServer: Database;
  arango: Database | undefined;
  constructor(config: { host: string; port: number; user: string; password: string }) {
    const connectionString = `http://${config.host}:${config.port}`;
    this.arangoServer = new Database(connectionString);
    this.arangoServer.useBasicAuth(config.user, config.password);
    log('DB:', connectionString);
  }

  ensureDatabase(name: string, context: any): Promise<Database> {
    log('Ensuring database', name);
    return Promise.resolve(this.arangoServer.listDatabases())
      .then(
        function (dbs: string[]) {
          if (!_.includes(dbs, name)) {
            return this.arangoServer.createDatabase(name);
          }
        }.bind(this),
      )
      .then(
        function () {
          this.arango = this.arangoServer.database(name);
          context.emit('ensure:db', this);
          return this.arango;
        }.bind(this),
      );
  }

  truncate() {
    if (this.arango === undefined) {
      return;
    }
    log('Truncate all collections');
    return Promise.resolve(this.arango.collections()).then((collections) => {
      return Promise.all(
        collections.map((collection: DocumentCollection | EdgeCollection) => {
          return Promise.resolve(collection.truncate());
        }),
      );
    });
  }

  listDatabases(): Promise<string[]> {
    log('List all databases');
    return Promise.resolve(this.arangoServer.listDatabases());
  }

  collections(): Promise<(DocumentCollection<any> & EdgeCollection<any>)[]> | undefined {
    if (this.arango === undefined) {
      return;
    }
    log('List all collections');
    return Promise.resolve(this.arango.collections());
  }

  query(q: string, bindVars: any) {
    if (this.arango === undefined) {
      return;
    }
    log('Execute the query: ' + q);
    return Promise.resolve(this.arango.query(q, bindVars));
  }

  ensureCollection(name: string, ...rest: any): Promise<Collection> | undefined {
    return this.ensure('collection', name, ...rest);
  }

  ensureEdgeCollection(name: string, ...rest: any): Promise<Collection> | undefined {
    return this.ensure('collection', name, ...rest);
  }

  ensureGraph(name: string, ...rest: any): Promise<Collection> | undefined {
    return this.ensure('graph', name, ...rest);
  }

  ensureService(serviceDirectory: string, mountPoint: any) {
    if (this.arango === undefined) {
      return;
    }
    log('Ensuring service', serviceDirectory, mountPoint);
    return this.arango.listServices().then(
      function (services: any) {
        const service = _.find(services, (s) => s.mount === mountPoint);

        const stream = utils.createZipStream(serviceDirectory);

        if (service) {
          log(`${mountPoint} already exists, upgrading`);
          return this.arango.upgradeService(mountPoint, stream);
        } else {
          log(`${mountPoint} does not exist, creating`);
          return this.arango.installService(mountPoint, stream);
        }
      }.bind(this),
    );
  }

  ensure(type: string | number, name: string, ...rest: any): Promise<Collection> | undefined {
    if (this.arango === undefined) {
      return;
    }

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
  }
}

export default Db;
