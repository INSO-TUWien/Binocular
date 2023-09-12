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

  static async getCommitDataForSha(sha) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitDataForSha(sha);
    } else {
      return LocalDB.getCommitDataForSha(sha);
    }
  }

  static async getCommitDataWithFiles(commitSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitDataWithFiles(commitSpan, significantSpan);
    } else {
      return LocalDB.getCommitDataWithFiles(commitSpan, significantSpan);
    }
  }

  static async getCommitDataWithFilesAndOwnership(commitSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitDataWithFilesAndOwnership(commitSpan, significantSpan);
    } else {
      return LocalDB.getCommitDataWithFilesAndOwnership(commitSpan, significantSpan);
    }
  }

  static async getCommitsForFiles(filenames) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitsForFiles(filenames);
    } else {
      return LocalDB.getCommitsForFiles(filenames);
    }
  }

  static async getCommitsWithFilesForFiles(filenames) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitsWithFilesForFiles(filenames);
    } else {
      return LocalDB.getCommitsWithFilesForFiles(filenames);
    }
  }

  static async getOwnershipDataForCommit(sha) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getOwnershipDataForCommit(sha);
    } else {
      return LocalDB.getOwnershipDataForCommit(sha);
    }
  }

  static async getOwnershipDataForCommits() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getOwnershipDataForCommits();
    } else {
      return LocalDB.getOwnershipDataForCommits();
    }
  }

  static async getOwnershipDataForFiles(files) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getOwnershipDataForFiles(files);
    } else {
      return LocalDB.getOwnershipDataForFiles(files);
    }
  }

  static async getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval, excludeMergeCommits) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval, excludeMergeCommits);
    } else {
      return LocalDB.getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval, excludeMergeCommits);
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

  static async getCommitsForIssue(iid) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getCommitsForIssue(iid);
    } else {
      return LocalDB.getCommitsForIssue(iid);
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
   * MERGE REQUESTS (GITLAB ONLY)
   */
  static async getMergeRequestData(mergeRequestSpan, significantSpan) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getMergeRequestData(mergeRequestSpan, significantSpan);
    } else {
      return LocalDB.getMergeRequestData(mergeRequestSpan, significantSpan);
    }
  }

  /**
   * MILESTONES
   */
  static async getMilestoneData() {
    if (await this.checkBackendConnection()) {
      return ServerDB.getMilestoneData();
    } else {
      return LocalDB.getMilestoneData();
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

  static async getFilenamesForBranch(branchName) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getFilenamesForBranch(branchName);
    } else {
      return LocalDB.getFilenamesForBranch(branchName);
    }
  }

  static async getPreviousFilenamesForFilesOnBranch(branchName) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getPreviousFilenamesForFilesOnBranch(branchName);
    } else {
      return LocalDB.getPreviousFilenamesForFilesOnBranch(branchName);
    }
  }

  static async getFilesForCommits(hashes) {
    if (await this.checkBackendConnection()) {
      return ServerDB.getFilesForCommits(hashes);
    } else {
      return LocalDB.getFilesForCommits(hashes);
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
