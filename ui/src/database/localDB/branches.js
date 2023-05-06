'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

export default class Branches {
  static getAllBranches(db) {
    return findAll(db, 'branches').then((res) => {
      const branches = res.docs.sort((a, b) => a.active < b.active);
      return { branches: { data: branches } };
    });
  }
}
