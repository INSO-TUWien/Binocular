'use strict';

import Bounds from './serverDB/bounds';
import Commits from './serverDB/commits';
import Builds from './serverDB/builds';
import Issues from './serverDB/issues';

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
}
