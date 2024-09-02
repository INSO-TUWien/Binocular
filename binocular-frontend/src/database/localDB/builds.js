'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { binarySearch, findAll, findAllCommits, findCommitBuildConnections, sortByAttributeString } from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Builds {
  static getBuildData(db, relations, commitSpan, significantSpan) {
    const from = significantSpan ? significantSpan[0] : new Date(0);
    const to = significantSpan ? significantSpan[1] : new Date();

    // add stats object to each build
    return findAll(db, 'builds').then(async (res) => {
      const allCommits = sortByAttributeString((await findAllCommits(db, relations)).docs, '_id');
      const commitBuildConnections = sortByAttributeString((await findCommitBuildConnections(relations)).docs, 'to');

      const emptyStats = { success: 0, failed: 0, pending: 0, cancelled: 0 };

      return res.docs
        .filter((build) => new Date(build.createdAt) >= from && new Date(build.createdAt) <= to)
        .map((build) => {
          const stats = Object.assign({}, emptyStats);
          if (build.status === 'success') {
            stats.success = 1;
          } else if (build.status === 'failed' || build.status === 'errored') {
            stats.failed = 1;
          } else if (build.status === 'cancelled') {
            stats.cancelled = 1;
          }
          build.stats = stats;
          build.commit = { sha: null, signature: null };

          const relevantConnection = binarySearch(commitBuildConnections, build._id, 'to');
          if (relevantConnection !== null) {
            const relevantCommit = binarySearch(allCommits, relevantConnection.from, '_id');
            if (relevantCommit !== null) {
              build.commit.sha = relevantCommit.sha;
              build.commit.signature = relevantCommit.signature;
            }
          }

          return build;
        });
    });
  }
}
