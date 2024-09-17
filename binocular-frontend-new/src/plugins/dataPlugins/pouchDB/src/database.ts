'use strict';
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import WorkerPouch from 'worker-pouch';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
PouchDB.adapter('worker', WorkerPouch);
import JSZip from 'jszip';
import { decompressJson } from '../../../../../../utils/json-utils.ts';

interface JSONObject {
  [key: string]: string | boolean | number;
}

class Database {
  public documentStore: PouchDB.Database | undefined;
  public edgeStore: PouchDB.Database | undefined;

  constructor() {}

  async init(file: { name: string | undefined; file: File | undefined }) {
    if (file.name) {
      return this.initDB(file.name).then((newDatabaseInitialized: boolean) => {
        if (newDatabaseInitialized && file.file !== undefined) {
          return new Promise((resolve) => {
            const jszip = new JSZip();
            let collectionsImported = 0;
            jszip
              .loadAsync(file.file)
              .then((zip) => {
                zip.forEach((fileName: string) => {
                  zip
                    .file(fileName)
                    ?.async('string')
                    .then((content) => {
                      const name = fileName.slice(0, fileName.length - 5).split('/')[1];
                      const JSONContent = JSON.parse(content);
                      if (name.includes('-')) {
                        this.importEdge(name, JSONContent).then(() => {
                          collectionsImported++;
                          if (collectionsImported >= Object.keys(zip.files).length) {
                            resolve(true);
                          }
                        });
                      } else {
                        this.importDocument(name, JSONContent).then(() => {
                          collectionsImported++;
                          if (collectionsImported >= Object.keys(zip.files).length) {
                            resolve(true);
                          }
                        });
                      }
                    })
                    .catch((e) => console.log(e));
                });
              })
              .catch((e) => console.log(e));
          });
        }
      });
    }
  }

  public delete() {
    if (this.documentStore) {
      this.documentStore.destroy();
    }
    if (this.edgeStore) {
      this.edgeStore.destroy();
    }
  }

  private initDB(name: string) {
    // check if web workers are supported
    return WorkerPouch.isSupportedBrowser().then((supported: boolean) => {
      if (supported) {
        // using web workers does not block the main thread, making the UI load faster.
        // note: worker adapter does not support custom indices!
        return this.assignDB(name, 'worker');
      } else {
        return this.assignDB(name, 'memory');
      }
    });
  }

  /*
  Return true when a new database was initialized and false when the database already existed
   */
  async assignDB(name: string, adapter: string): Promise<boolean> {
    this.documentStore = new PouchDB(`${name}_documents`, { adapter: adapter });
    this.edgeStore = new PouchDB(`${name}_edges`, { adapter: adapter });
    const documentStoreInfo = await this.documentStore.info();
    const edgeStoreInfo = await this.edgeStore.info();
    return !(documentStoreInfo.doc_count > 0 && edgeStoreInfo.doc_count > 0);
  }

  preprocessCollection(coll: JSONObject[]) {
    return coll.map((row) => {
      // key and rev not needed for pouchDB
      delete row._key;
      delete row._rev;
      // rename _from/_to if this is a connection
      if (row._from !== undefined) {
        row.from = row._from;
        row.to = row._to;
        delete row._from;
        delete row._to;
      }
      return row;
    });
  }

  importDocument(name: string, content: JSONObject[]) {
    return new Promise((resolve, reject) => {
      // first decompress the json file, then remove attributes that are not needed by PouchDB
      if (this.documentStore) {
        this.documentStore
          .bulkDocs(this.preprocessCollection(decompressJson(name, content)))
          .then(() => {
            console.log(`${name} imported successfully`);
            resolve(true);
          })
          .catch(() => {
            console.log(`error importing ${name}`);
            reject();
          });
      }
    });
  }

  importEdge(name: string, content: JSONObject[]) {
    return new Promise((resolve, reject) => {
      // first decompress the json file, then remove attributes that are not needed by PouchDB
      if (this.edgeStore) {
        this.edgeStore
          .bulkDocs(this.preprocessCollection(decompressJson(name, content)))
          .then(() => {
            console.log(`${name} imported successfully`);
            resolve(true);
          })
          .catch(() => {
            console.log(`error importing ${name}`);
            reject();
          });
      }
    });
  }
}

export { Database };
