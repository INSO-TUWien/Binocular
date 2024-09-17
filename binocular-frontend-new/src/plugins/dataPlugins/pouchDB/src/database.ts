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

  async init(file: File) {
    await this.initDB().then((newDatabaseInitialized: boolean) => {
      if (newDatabaseInitialized) {
        const jszip = new JSZip();
        jszip
          .loadAsync(file)
          .then((zip) => {
            zip.forEach((fileName: string) => {
              zip
                .file(fileName)
                ?.async('string')
                .then((content) => {
                  const name = fileName.slice(0, fileName.length - 5).split('/')[1];
                  const JSONContent = JSON.parse(content);
                  if (name.includes('-')) {
                    this.importEdge(name, JSONContent);
                  } else {
                    this.importDocument(name, JSONContent);
                  }
                })
                .catch((e) => console.log(e));
            });
          })
          .catch((e) => console.log(e));
      }
    });
  }

  private initDB() {
    // check if web workers are supported
    return WorkerPouch.isSupportedBrowser().then((supported: boolean) => {
      if (supported) {
        // using web workers does not block the main thread, making the UI load faster.
        // note: worker adapter does not support custom indices!
        return this.assignDB('worker');
      } else {
        return this.assignDB('memory');
      }
    });
  }

  /*
  Return true when a new database was initialized and false when the database already existed
   */
  async assignDB(adapter: string): Promise<boolean> {
    this.documentStore = new PouchDB('Binocular_documents', { adapter: adapter });
    this.edgeStore = new PouchDB('Binocular_edges', { adapter: adapter });
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
    // first decompress the json file, then remove attributes that are not needed by PouchDB
    if (this.documentStore) {
      this.documentStore
        .bulkDocs(this.preprocessCollection(decompressJson(name, content)))
        .then(() => console.log(`${name} imported successfully`))
        .catch(() => console.log(`error importing ${name}`));
    }
  }

  importEdge(name: string, content: JSONObject[]) {
    // first decompress the json file, then remove attributes that are not needed by PouchDB
    if (this.edgeStore) {
      this.edgeStore
        .bulkDocs(this.preprocessCollection(decompressJson(name, content)))
        .then(() => console.log(`${name} imported successfully`))
        .catch(() => console.log(`error importing ${name}`));
    }
  }
}

export { Database };
