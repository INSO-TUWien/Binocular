'use strict';
import { graphQl } from '../utils';
import ServerDB from './serverDB';
import LocalDB from './localDB';

export default class Database {
  static async initDB() {
    if (!(await this.checkBackendConnection())) {
      await LocalDB.initDB();
      return false;
    }
    return true;
  }

  static async getBounds() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getBounds();
    } else {
      return LocalDB.getBounds();
    }
  }

  static async getCommitData(commitSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitData(commitSpan, significantSpan);
    } else {
      return LocalDB.getCommitData(commitSpan, significantSpan);
    }
  }

  static async getBuildData(commitSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getBuildData(commitSpan, significantSpan);
    } else {
      return LocalDB.getBuildData(commitSpan, significantSpan);
    }
  }

  static async getIssueData(issueSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getIssueData(issueSpan, significantSpan);
    } else {
      return LocalDB.getIssueData(issueSpan, significantSpan);
    }
  }

  static async checkBackendConnection() {
    return new Promise((resolve) => {
      graphQl
        .query(
          `{
         committers
       }`
        )
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }
}
