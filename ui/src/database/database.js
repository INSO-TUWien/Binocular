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

  /**
   * COMMITS
   */

  static async getCommitData(commitSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitData(commitSpan, significantSpan);
    } else {
      return LocalDB.getCommitData(commitSpan, significantSpan);
    }
  }

  static async getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
    } else {
      return LocalDB.getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
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

  static async getCodeHotspotsChangeData(file) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCodeHotspotsChangeData(file);
    } else {
      return LocalDB.getCodeHotspotsChangeData(file);
    }
  }

  /**
   * BUILDS
   */
  static async getBuildData(commitSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getBuildData(commitSpan, significantSpan);
    } else {
      return LocalDB.getBuildData(commitSpan, significantSpan);
    }
  }

  static async getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
    } else {
      return LocalDB.getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
    }
  }

  /**
   * ISSUES
   */
  static async getIssueData(issueSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getIssueData(issueSpan, significantSpan);
    } else {
      return LocalDB.getIssueData(issueSpan, significantSpan);
    }
  }

  static async getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval);
    } else {
      return LocalDB.getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval);
    }
  }

  static async issueImpactQuery(iid, since, until) {
    if (await this.checkBackendConnection()) {
      return ServerDB.issueImpactQuery(iid, since, until);
    } else {
      return LocalDB.issueImpactQuery(iid, since, until);
    }
  }

  static async searchIssues(text) {
    if (await this.checkBackendConnection()) {
      return ServerDB.searchIssues(text);
    } else {
      return LocalDB.searchIssues(text);
    }
  }

  static async getCodeHotspotsIssueData(file) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCodeHotspotsIssueData(file);
    } else {
      return LocalDB.getCodeHotspotsIssueData(file);
    }
  }

  /**
   * FILES
   */
  static async requestFileStructure() {
    if (await this.checkBackendConnection()) {
      return ServerDB.requestFileStructure();
    } else {
      return LocalDB.requestFileStructure();
    }
  }

  static async getFileDataFileEvolutionDendrogram() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getFileDataFileEvolutionDendrogram();
    } else {
      return LocalDB.getFileDataFileEvolutionDendrogram();
    }
  }

  /**
   * BRANCHES
   */
  static async getAllBranches() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getAllBranches();
    } else {
      return LocalDB.getAllBranches();
    }
  }

  /**
   * LANGUAGES
   */
  static async getAllLanguages() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getAllLanguages();
    } else {
      return LocalDB.getAllLanguages();
    }
  }

  /**
   * MODULES
   */
  static async getAllModules() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getAllModules();
    } else {
      return LocalDB.getAllModules();
    }
  }

  /**
   * STAKEHOLDER
   */
  static async getAllStakeholders() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getAllStakeholders();
    } else {
      return LocalDB.getAllStakeholders();
    }
  }

  /**
   * DATABASE
   */
  static async getDatabase() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getDatabase();
    } else {
      return LocalDB.getDatabase();
    }
  }

  static async checkBackendConnection() {
    return new Promise((resolve) => {
      if (location.protocol === 'file:') {
        resolve(false);
        return;
      }
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
