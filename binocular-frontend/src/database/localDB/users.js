'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import _ from 'lodash';
import { findAll } from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Users {
  static getAllUsers(db) {
    return findAll(db, 'users').then((res) => {
      return { users: { data: res.docs } };
    });
  }
}
