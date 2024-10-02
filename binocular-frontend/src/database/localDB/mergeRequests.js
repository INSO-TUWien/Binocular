'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { findAll } from './utils';
import _ from 'lodash';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class MergeRequests {
  static getMergeRequestData(db, mergeRequestsSpan, significantSpan) {
    // return all issues, filtering according to parameters can be added in the future
    return findAll(db, 'mergeRequests').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((i) => new Date(i.createdAt) >= new Date(significantSpan[0]) && new Date(i.createdAt) <= new Date(significantSpan[1]));
      return res.docs;
    });
  }
}
