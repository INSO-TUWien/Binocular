'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { findAll } from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Bounds {
  static getBounds(db) {
    return Promise.all([findAll(db, 'users'), findAll(db, 'commits'), findAll(db, 'issues')]).then((res) => {
      const response = { committers: [] };

      // all committers
      res[0].docs.forEach((doc) => response.committers.push(doc.gitSignature));

      // first and last commit
      res[1].docs = res[1].docs.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      response.firstCommit = res[1].docs[0];
      response.lastCommit = res[1].docs[res[1].docs.length - 1];

      // first and last issue
      res[2].docs = res[2].docs.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      response.firstIssue = res[2].docs[0];
      response.lastIssue = res[2].docs[res[2].docs.length - 1];
      return response;
    });
  }
}
