'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { findAll } from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Branches {
  static getAllBranches(db) {
    return findAll(db, 'branches').then((res) => {
      const branches = res.docs.sort((a, b) => a.active < b.active);
      return { branches: { data: branches } };
    });
  }
}
