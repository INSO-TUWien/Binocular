import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import JSZip from 'jszip';

import { WorkerPouchDB } from './worker/WorkerPouchDB';
import { decompressJson } from '../../../../utils/json-utils';
import type { FileConfig, JSONObject } from '../../../interfaces/dataPluginInterfaces/dataPluginFiles';
import type { MetadataType } from '../../../../types/data/MetadataType';

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Database {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public documentStore: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public edgeStore: any;

  async initDB(
    file: FileConfig,
    startTime?: number,
    setUploadInfo?: (message: string) => void | undefined,
  ): Promise<MetadataType | undefined> {
    if (!file.name) return undefined;

    const initialized = await this.createDB(file.name);

    if (!initialized) return undefined;

    if (file.file) {
      return this.importFromZip(file.file, startTime, setUploadInfo);
    }

    if (file.dbObjects) {
      return this.importFromObjects(file.dbObjects, startTime, setUploadInfo);
    }

    return undefined;
  }

  async delete() {
    await this.documentStore?.destroy();
    await this.edgeStore?.destroy();
  }

  private async createDB(name: string) {
    const useWorker = typeof Worker !== 'undefined';

    if (useWorker) {
      this.documentStore = new WorkerPouchDB(`${name}_documents`);
      this.edgeStore = new WorkerPouchDB(`${name}_edges`);
    } else {
      this.documentStore = new PouchDB(`${name}_documents`, { adapter: 'memory' });
      this.edgeStore = new PouchDB(`${name}_edges`, { adapter: 'memory' });
    }

    const d = await this.documentStore.info();
    const e = await this.edgeStore.info();

    return !(d.doc_count > 0 && e.doc_count > 0);
  }

  preprocess(coll: JSONObject[]) {
    return coll.map((row) => {
      // key and rev not needed for pouchDB
      delete row._key;
      delete row._rev;
      // rename _from/_to if this is a connection
      if (row._from) {
        row.from = row._from;
        row.to = row._to;
        delete row._from;
        delete row._to;
      }
      return row;
    });
  }

  async importDocument(name: string, content: JSONObject[]) {
    // first decompress the json file, then remove attributes that are not needed by PouchDB
    const docs = this.preprocess(decompressJson(name, content));
    await this.documentStore.bulkDocs(docs);
  }

  async importEdge(name: string, content: JSONObject[]) {
    // first decompress the json file, then remove attributes that are not needed by PouchDB
    const docs = this.preprocess(decompressJson(name, content));
    await this.edgeStore.bulkDocs(docs);
  }

  // both import functions are not running in parallel to avoid overloading pouchDB(testing necessary before changing to parallel)
  async importFromZip(
    file: Blob,
    startTime?: number,
    setUploadInfo?: (message: string) => void | undefined,
  ): Promise<MetadataType | undefined> {
    const zip = await new JSZip().loadAsync(file);

    // Read metadata first
    const metadataEntry = Object.values(zip.files).find((f) => !f.dir && f.name.includes('metadata'));

    let metadata: MetadataType | undefined = undefined;
    if (metadataEntry) {
      const raw = await metadataEntry.async('string');
      metadata = JSON.parse(raw) as MetadataType;
    }

    // Filter out folders and metadata
    const fileEntries = Object.values(zip.files)
      .filter((f) => !f.dir)
      .filter((f) => !f.name.includes('metadata'));
    const totalFiles = fileEntries.length;
    let imported = 0;

    for (const fileEntry of fileEntries) {
      const raw = await fileEntry.async('string');
      const json = JSON.parse(raw);

      const name = fileEntry.name.split('/')[1].replace('.json', '');
      if (setUploadInfo) setUploadInfo(`${imported}/${totalFiles} importing ${name}`);

      if (name.includes('-')) {
        await this.importEdge(name, json);
      } else {
        await this.importDocument(name, json);
      }

      imported++;
      const end = performance.now();
      console.log(`${imported}/${totalFiles} ${name} imported in ${Math.trunc(end - (startTime ?? end))} ms`);
    }
    return metadata;
  }

  async importFromObjects(
    dbObjects: Record<string, JSONObject[]>,
    startTime?: number,
    setUploadInfo?: (message: string) => void | undefined,
  ): Promise<undefined> {
    const keys = Object.keys(dbObjects);
    let imported = 0;

    return new Promise((resolve) => {
      keys.forEach(async (name) => {
        if (setUploadInfo) setUploadInfo(`${imported}/${keys.length} importing ${name}`);
        if (name.includes('-')) {
          await this.importEdge(name, dbObjects[name]);
        } else {
          await this.importDocument(name, dbObjects[name]);
        }

        if (setUploadInfo) setUploadInfo(`${imported}/${keys.length} ${name} imported`);
        imported++;
        const end = performance.now();
        console.log(`${imported}/${keys.length} ${name} imported in ${Math.trunc(end - (startTime ?? end))} ms`);

        if (imported >= keys.length) resolve(undefined);
      });
    });
  }

  async export(metadata: MetadataType | undefined) {
    const edges = await this.edgeStore.export();
    const docs = await this.documentStore.export();
    const zip = await new JSZip();
    const db_export = zip.folder('db_export');
    db_export!.file('metadata.json', metadata ? JSON.stringify(metadata) : '');
    let data: object[] = [];
    let collectionName = docs.rows[0].id.split('/')[0];
    docs.rows.forEach((row: { id: string; doc: JSONObject }) => {
      if (row.id.split('/')[0] == collectionName) data.push(row.doc);
      else {
        db_export!.file(collectionName + '.json', JSON.stringify(data));
        data = [];
        collectionName = row.id.split('/')[0];
        data.push(row.doc);
      }
    });
    edges.rows.forEach((row: { id: string; doc: JSONObject }) => {
      if (row.id.startsWith(collectionName)) data.push(row.doc);
      else {
        db_export!.file(collectionName + '.json', JSON.stringify(data));
        data = [];
        collectionName = row.id.split('/')[0];
        data.push(row.doc);
      }
    });
    db_export!.file(collectionName + '.json', JSON.stringify(data));
    zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } }).then((file) => {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      const url = window.URL.createObjectURL(file);
      a.href = url;
      a.download = 'db_export.zip';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
