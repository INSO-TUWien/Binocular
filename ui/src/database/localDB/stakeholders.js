'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import _ from 'lodash';
import moment from 'moment/moment';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

export default class Stakeholders {
  static getAllStakeholders(db) {
    return findAll(db, 'stakeholders').then((res) => {
      return { stakeholders: { data: res.docs } };
    });
  }
}
