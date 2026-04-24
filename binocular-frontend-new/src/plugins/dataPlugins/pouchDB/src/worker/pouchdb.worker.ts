// reference lib webworker
import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

const cache: Record<string, PouchDB.Database> = {};

self.onmessage = async (event) => {
  const { id, action, name, doc, options } = event.data;

  try {
    const db = cache[name];
    if (!db && action !== 'init') throw new Error('Database not initialized');

    let result;

    switch (action) {
      case 'init':
        cache[name] = new PouchDB(name);
        result = { ok: true };
        break;

      case 'bulkDocs':
        result = await db.bulkDocs(doc);
        break;

      case 'put':
        result = await db.put(doc);
        break;

      case 'get':
        result = await db.get(doc._id);
        break;

      case 'info':
        result = await db.info();
        break;

      case 'destroy':
        result = await db.destroy();
        delete cache[name];
        result = { ok: true };
        break;

      case 'allDocs':
        result = await db.allDocs(options);
        break;

      case 'find':
        result = await db.find(options);
        break;

      case 'createIndex':
        result = await db.createIndex(options);
        break;

      case 'export':
        result = await db.allDocs({ include_docs: true, attachments: true });
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).postMessage({ id, result });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).postMessage({ id, error: e.message });
  }
};
