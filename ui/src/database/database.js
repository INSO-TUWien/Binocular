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

  static async getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
    } else {
      return LocalDB.getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
    }
  }

  static async getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
    } else {
      return LocalDB.getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
    }
  }

  static async getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval);
    } else {
      return LocalDB.getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval);
    }
  }

  static async getRelatedCommitDataOwnershipRiver(issue) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getRelatedCommitDataOwnershipRiver(issue);
    } else {
      return LocalDB.getRelatedCommitDataOwnershipRiver(issue);
    }
  }

  static async getCommitDateHistogram(granularity, dateField, since, until) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitDateHistogram(granularity, dateField, since, until);
    } else {
      return LocalDB.getCommitDateHistogram(granularity, dateField, since, until);
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
