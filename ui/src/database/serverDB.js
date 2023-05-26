'use strict';

import Bounds from './serverDB/bounds';
import Commits from './serverDB/commits';
import Builds from './serverDB/builds';
import Issues from './serverDB/issues';
import Files from './serverDB/files';
import Branches from './serverDB/branches';
import Languages from './serverDB/languages';
import Modules from './serverDB/modules';
import Stakeholders from './serverDB/stakeholders';

export default class ServerDB {
  static getBounds() {
    return Bounds.getBounds();
  }

  static getCommitData(commitSpan, significantSpan) {
    return Commits.getCommitData(commitSpan, significantSpan);
  }

  static getBuildData(commitSpan, significantSpan) {
    return Builds.getBuildData(commitSpan, significantSpan);
  }

  static getIssueData(issueSpan, significantSpan) {
    return Issues.getIssueData(issueSpan, significantSpan);
  }

  static getCommitDataWithFiles(commitSpan, significantSpan) {
    return Commits.getCommitDataWithFiles(commitSpan, significantSpan);
  }

  static getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    return Commits.getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
  }

  static getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    return Builds.getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval);
  }

  static getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval) {
    return Issues.getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval);
  }

  static getRelatedCommitDataOwnershipRiver(issue) {
    return Commits.getRelatedCommitDataOwnershipRiver(issue);
  }

  static getCommitDateHistogram(granularity, dateField, since, until) {
    return Commits.getCommitDateHistogram(granularity, dateField, since, until);
  }

  static getCommitsForIssue(iid) {
    return Issues.getCommitsForIssue(iid);
  }

  static getCommitsForFiles(filenames) {
    return Commits.getCommitsForFiles(filenames);
  }

  static issueImpactQuery(iid, since, until) {
    return Issues.issueImpactQuery(iid, since, until);
  }

  static searchIssues(text) {
    return Issues.searchIssues(text);
  }

  static requestFileStructure() {
    return Files.requestFileStructure();
  }

  static getFilenamesForBranch(branchName) {
    return Files.getFilenamesForBranch(branchName);
  }

  static getFilesForCommits(hashes) {
    return Files.getFilesForCommits(hashes);
  }

  static getAllBranches() {
    return Branches.getAllBranches();
  }

  static getAllLanguages() {
    return Languages.getAllLanguages();
  }

  static getAllModules() {
    return Modules.getAllModules();
  }

  static getAllStakeholders() {
    return Stakeholders.getAllStakeholders();
  }

  static getCodeHotspotsChangeData(file) {
    return Commits.getCodeHotspotsChangeData(file);
  }

  static getCodeHotspotsIssueData(file) {
    return Issues.getCodeHotspotsIssueData(file);
  }

  static getDatabase() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', window.location.protocol + '//' + window.location.hostname + ':48763/api/db-export', false);
    xhr.send();
    if (xhr.readyState === 4 && xhr.status === 200) {
      return JSON.parse(xhr.responseText);
    }
    return {};
  }
}
