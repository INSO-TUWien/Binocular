'use strict';

import Bounds from './serverDB/bounds';
import Commits from './serverDB/commits';
import Builds from './serverDB/builds';
import Issues from './serverDB/issues';
import MergeRequests from './serverDB/mergeRequests';
import Milestones from './serverDB/milestones';
import Files from './serverDB/files';
import Branches from './serverDB/branches';
import Modules from './serverDB/modules';
import Stakeholders from './serverDB/stakeholders';

export default class ServerDB {
  static getBounds() {
    return Bounds.getBounds();
  }

  static getCommitData(commitSpan, significantSpan) {
    return Commits.getCommitData(commitSpan, significantSpan);
  }

  static getCommitDataForSha(sha) {
    return Commits.getCommitDataForSha(sha);
  }

  static getBuildData(commitSpan, significantSpan) {
    return Builds.getBuildData(commitSpan, significantSpan);
  }

  static getIssueData(issueSpan, significantSpan) {
    return Issues.getIssueData(issueSpan, significantSpan);
  }

  static getCommitsForIssue(iid) {
    return Issues.getCommitsForIssue(iid);
  }

  static getMergeRequestData(mergeRequestSpan, significantSpan) {
    return MergeRequests.getMergeRequestData(mergeRequestSpan, significantSpan);
  }

  static getMilestoneData() {
    return Milestones.getMilestoneData();
  }

  static getCommitDataWithFiles(commitSpan, significantSpan) {
    return Commits.getCommitDataWithFiles(commitSpan, significantSpan);
  }

  static getCommitDataWithFilesAndOwnership(commitSpan, significantSpan) {
    return Commits.getCommitDataWithFilesAndOwnership(commitSpan, significantSpan);
  }

  static getOwnershipDataForCommit(sha) {
    return Commits.getOwnershipDataForCommit(sha);
  }

  static getOwnershipDataForCommits() {
    return Commits.getOwnershipDataForCommits();
  }

  static getOwnershipDataForFiles(files) {
    return Files.getOwnershipDataForFiles(files);
  }

  static getCommitsForFiles(filenames) {
    return Commits.getCommitsForFiles(filenames, true);
  }

  static getCommitsWithFilesForFiles(filenames) {
    return Commits.getCommitsForFiles(filenames, false);
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

  static getPreviousFilenamesForFilesOnBranch(branchName) {
    return Files.getPreviousFilenamesForFilesOnBranch(branchName);
  }

  static getFilesForCommits(hashes) {
    return Files.getFilesForCommits(hashes);
  }

  static getAllBranches() {
    return Branches.getAllBranches();
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
