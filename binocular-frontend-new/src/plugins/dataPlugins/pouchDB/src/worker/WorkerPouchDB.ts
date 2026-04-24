export class WorkerPouchDB {
  private worker: Worker;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks = new Map<string, (data: any) => void>();
  private readonly name: string;

  constructor(name: string) {
    this.name = name;

    this.worker = new Worker(new URL('./pouchdb.worker.ts', import.meta.url), { type: 'module' });

    this.worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const cb = this.callbacks.get(id);
      if (!cb) return;

      if (error) cb(Promise.reject(error));
      else cb(result);

      this.callbacks.delete(id);
    };

    this.worker.onerror = (e) => {
      console.error('Worker error:', e.message);
    };

    this.worker.onmessageerror = (e) => {
      console.error('Worker message error:', e);
    };

    this.send('init', {});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private send(action: string, data: any = {}, callback?: (msg: any) => void) {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      if (callback) this.callbacks.set(id, callback);
      else
        this.callbacks.set(id, (msg) => {
          if (msg instanceof Promise) reject(msg);
          else resolve(msg);
        });

      this.worker.postMessage({ id, action, name: this.name, ...data });
    });
  }

  init() {
    return this.send('init');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put(doc: any) {
    return this.send('put', { doc });
  }

  get(id: string) {
    return this.send('get', { doc: { _id: id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bulkDocs(docs: any[]) {
    return this.send('bulkDocs', { doc: docs });
  }

  destroy() {
    return this.send('destroy');
  }

  info() {
    return this.send('info');
  }

  allDocs(options?: PouchDB.Core.AllDocsOptions) {
    return this.send('allDocs', { options });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  find(options: PouchDB.Find.FindRequest<any>) {
    return this.send('find', { options });
  }

  createIndex(options: PouchDB.Find.CreateIndexOptions) {
    return this.send('createIndex', { options });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changes(options: PouchDB.Core.ChangesOptions, callback: (change: PouchDB.Core.ChangesResponseChange<any>) => void) {
    return this.send('changes', { options }, callback);
  }

  export() {
    return this.send('export');
  }
}
