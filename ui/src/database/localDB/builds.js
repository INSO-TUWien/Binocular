'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import moment from 'moment/moment';
import _ from 'lodash';
import { findAll, findCommitBuildConnections } from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Builds {
  static getBuildData(db, relations, commitSpan, significantSpan) {
    // add stats object to each build
    return findAll(db, 'builds').then(async (res) => {
      const allCommits = (await findAll(db, 'commits')).docs;
      const commitBuildConnections = (await findCommitBuildConnections(relations)).docs;

      const emptyStats = { success: 0, failed: 0, pending: 0, cancelled: 0 };

      return res.docs.map((build) => {
        const stats = Object.assign({}, emptyStats);

        if (build.status === 'success') {
          stats.success = 1;
        } else if (build.status === 'failed' || build.status === 'errored') {
          stats.failed = 1;
        } else if (build.status === 'cancelled') {
          stats.cancelled = 1;
        }
        build.stats = stats;
        build.commit = { sha: null };

        const relevantConnection = commitBuildConnections.filter((cb) => cb.from === build._id);
        if (relevantConnection.length !== 0) {
          const relevantCommit = allCommits.filter((c) => c._id === relevantConnection[0].to);
          if (relevantCommit.length !== 0) {
            build.commit.sha = relevantCommit[0].sha;
          }
        }

        return build;
      });
    });
  }

  static getBuildDataOwnershipRiver(db, commitSpan, significantSpan, granularity, interval) {
    let next = moment(significantSpan[0]).startOf('day').toDate().getTime();
    const data = [
      {
        date: new Date(significantSpan[0]),
        stats: {
          success: 0,
          failed: 0,
          pending: 0,
          cancelled: 0,
        },
      },
    ];

    return findAll(db, 'builds').then((res) => {
      res.docs.map((build) => {
        const createdAt = Date.parse(build.createdAt);

        while (createdAt >= next) {
          const dataPoint = {
            date: new Date(next),
            stats: _.defaults(
              {
                total: (build.stats.success || 0) + (build.stats.failed || 0) + (build.stats.pending || 0) + (build.stats.cancelled || 0),
              },
              build.stats
            ),
          };

          data.push(dataPoint);
          next += interval;
        }

        return build;
      });
      return data;
    });
  }
}
