'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import moment from 'moment/moment';
import _ from 'lodash';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

export default class Milestones {
  static getMilestoneData(db) {
    // return all issues, filtering according to parameters can be added in the future
    return findAll(db, 'milestones').then((res) => {
      res.docs = res.docs.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      return res.docs;
    });
  }
}
