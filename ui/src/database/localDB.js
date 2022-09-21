'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

import branches from '../../arango_export/branches.json';
import builds from '../../arango_export/builds.json';
import commitsCommits from '../../arango_export/commits-commits.json';
import commitsFiles from '../../arango_export/commits-files.json';
import commitsLanguages from '../../arango_export/commits-languages.json';
import commitsModules from '../../arango_export/commits-modules.json';
import commitsStakeholders from '../../arango_export/commits-stakeholders.json';
import commits from '../../arango_export/commits.json';
import files from '../../arango_export/files.json';
import issuesCommits from '../../arango_export/issues-commits.json';
import issuesStakeholders from '../../arango_export/issues-stakeholders.json';
import issues from '../../arango_export/issues.json';
import languagesFiles from '../../arango_export/languages-files.json';
import languages from '../../arango_export/languages.json';
import modulesFiles from '../../arango_export/modules-files.json';
import modulesModules from '../../arango_export/modules-modules.json';
import modules from '../../arango_export/modules.json';
import stakeholders from '../../arango_export/stakeholders.json';
import moment from 'moment';
import _ from 'lodash';

const collections = { branches, builds, commits, files, issues, languages, modules, stakeholders };

const relations = {
  'commits-commits': commitsCommits,
  'commits-files': commitsFiles,
  'commits-languages': commitsLanguages,
  'commits-modules': commitsModules,
  'commits-stakeholders': commitsStakeholders,
  'issues-commits': issuesCommits,
  'issues-stakeholders': issuesStakeholders,
  'languages-files': languagesFiles,
  'modules-files': modulesFiles,
  'modules-modules': modulesModules,
};

// create database, index on _id and triple store
const db = new PouchDB('Binocular_collections', { adapter: 'memory' });
const tripleStore = new PouchDB('Binocular_triple', { adapter: 'memory' });

db.createIndex({
  index: { fields: ['_id'] },
});

function importCollection(name) {
  collections[name].forEach((item) => {
    delete item._rev;
    delete item._key;

    db.put(item);
  });
}

function importRelation(name) {
  relations[name].forEach((item) => {
    delete item._rev;
    delete item._key;

    item.from = item._from;
    item.to = item._to;
    delete item._from;
    delete item._to;

    item.relation = name;
    tripleStore.put(item);
  });
}

function importData() {
  // import collections iff DB does not already exist
  /*db.info().then((res) => {
    console.log(res);
    if (res.doc_count === 0) {*/
  Object.keys(collections).forEach((name) => {
    console.log(`Importing collection ${name}`);

    importCollection(name);
  });

  /*  }
  });*/

  // import relations iff triple store does not already exist
  /*tripleStore.info().then((res) => {
    if (res.doc_count === 0) {*/
  Object.keys(relations).forEach((name) => {
    console.log(`Importing relation ${name}`);

    importRelation(name);
  });
  //  }
  //});
}

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(collection) {
  return db.find({
    selector: { _id: { $regex: new RegExp(`^${collection}\/.*`) } },
  });
}

export default class LocalDB {
  static initDB() {
    importData();
  }

  static getBounds() {
    return Promise.all([findAll('stakeholders'), findAll('commits'), findAll('issues')]).then((res) => {
      const response = { committers: [] };

      // all committers
      res[0].docs.forEach((doc) => response.committers.push(doc.gitSignature));

      // first and last commit
      res[1].docs = res[1].docs.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      response.firstCommit = res[1].docs[0];
      response.lastCommit = res[1].docs[res[1].docs.length - 1];

      // first and last issue
      res[2].docs = res[2].docs.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      response.firstIssue = res[2].docs[0];
      response.lastIssue = res[2].docs[res[2].docs.length - 1];
      return response;
    });
  }

  static getCommitData(commitSpan, significantSpan) {
    // return all commits, filtering according to parameters can be added in the future
    return findAll('commits').then((res) => {
      res.docs = res.docs.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      return res.docs;
    });
  }

  static getBuildData(commitSpan, significantSpan) {
    // add stats object to each build
    return findAll('builds').then((res) => {
      const emptyStats = { success: 0, failed: 0, pending: 0, canceled: 0 };

      return res.docs.map((build) => {
        const stats = Object.assign({}, emptyStats);

        if (build.status === 'success') {
          stats.success = 1;
        } else if (build.status === 'failed' || build.status === 'errored') {
          stats.failed = 1;
        }

        build.stats = stats;

        return build;
      });
    });
  }

  static getIssueData(issueSpan, significantSpan) {
    // return all issues, filtering according to parameters can be added in the future
    return findAll('issues').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((i) => new Date(i.createdAt) >= new Date(significantSpan[0]) && new Date(i.createdAt) <= new Date(significantSpan[1]));
      return res.docs;
    });
  }

  static getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    const statsByAuthor = {};

    const totals = {
      count: 0,
      additions: 0,
      deletions: 0,
      changes: 0,
    };

    const data = [
      {
        date: new Date(significantSpan[0]),
        totals: _.cloneDeep(totals),
        statsByAuthor: {},
      },
    ];

    let next = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();
    const first = new Date(significantSpan[0]).getTime();
    const last = new Date(significantSpan[1]).getTime();
    function group(data) {
      const lastDatum = _.last(data);

      if (_.keys(lastDatum.statsByAuthor).length < 50) {
        return data;
      }

      const meanCommitCount = _.meanBy(_.values(lastDatum.statsByAuthor), 'count');
      const threshhold = meanCommitCount;

      const applyGroupBy = (stats, predicate) => {
        const groupStats = {
          count: 0,
          additions: 0,
          deletions: 0,
          changes: 0,
        };
        const groupedCommitters = [];

        const groupedStats = _.omitBy(stats, (stats, author) => {
          if (predicate(stats, author)) {
            groupStats.count += stats.count;
            groupStats.additions += stats.additions;
            groupStats.deletions += stats.deletions;
            groupStats.changes += stats.changes;
            groupedCommitters.push(author);
            return true;
          }
        });

        groupedStats.other = groupStats;

        return {
          groupedStats,
          groupedCommitters,
        };
      };

      const { groupedCommitters } = applyGroupBy(lastDatum.statsByAuthor, (stats) => {
        return stats.count <= threshhold;
      });

      _.each(data, (datum) => {
        const { groupedStats } = applyGroupBy(datum.statsByAuthor, (stats, author) => _.includes(groupedCommitters, author));

        datum.statsByAuthor = groupedStats;
      });

      return data;
    }

    return findAll('commits').then((res) => {
      const commits = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      commits.map((commit) => {
        const dt = Date.parse(commit.date);
        let stats = statsByAuthor[commit.signature];
        if (!stats) {
          stats = statsByAuthor[commit.signature] = {
            count: 0,
            additions: 0,
            deletions: 0,
            changes: 0,
          };
        }

        totals.count++;
        totals.additions += commit.stats.additions;
        totals.deletions += commit.stats.deletions;
        totals.changes += commit.stats.additions + commit.stats.deletions;

        stats.count++;
        stats.additions += commit.stats.additions;
        stats.deletions += commit.stats.deletions;
        stats.changes += commit.stats.additions + commit.stats.deletions;

        while (dt >= next) {
          const dataPoint = {
            date: new Date(next),
            totals: _.cloneDeep(totals),
            statsByAuthor: _.cloneDeep(statsByAuthor),
          };

          data.push(dataPoint);
          next += interval;
        }
      });
      data.push({
        date: new Date(significantSpan[1]),
        totals: _.cloneDeep(totals),
        statsByAuthor: _.cloneDeep(statsByAuthor),
      });
      console.log(significantSpan[1].toString());

      return group(data);
    });
  }

  static getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    let next = moment(significantSpan[0]).startOf('day').toDate().getTime();
    const data = [
      {
        date: new Date(significantSpan[0]),
        stats: {
          success: 0,
          failed: 0,
          pending: 0,
          canceled: 0,
        },
      },
    ];

    return findAll('builds').then((res) => {
      res.docs.map((build) => {
        const createdAt = Date.parse(build.createdAt);

        while (createdAt >= next) {
          const dataPoint = {
            date: new Date(next),
            stats: _.defaults(
              {
                total: (build.stats.success || 0) + (build.stats.failed || 0) + (build.stats.pending || 0) + (build.stats.canceled || 0),
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

  static getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval) {
    // holds close dates of still open issues, kept sorted at all times
    const pendingCloses = [];

    // issues closed so far
    let closeCountTotal = 0,
      count = 0;

    let next = moment(significantSpan[0]).startOf('day').toDate().getTime();
    const data = [
      {
        date: new Date(issueSpan[0]),
        count: 0,
        openCount: 0,
        closedCount: 0,
      },
    ];
    return findAll('issues').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((i) => new Date(i.createdAt) >= new Date(significantSpan[0]) && new Date(i.createdAt) <= new Date(significantSpan[1]))
        .map((issue) => {
          const createdAt = Date.parse(issue.createdAt);
          const closedAt = issue.closedAt ? Date.parse(issue.closedAt) : null;

          count++;

          // the number of closed issues at the issue's creation time, since
          // the last time we increased closedCountTotal
          const closedCount = _.sortedIndex(pendingCloses, createdAt);
          closeCountTotal += closedCount;

          // remove all issues that are closed by now from the "pending" list
          pendingCloses.splice(0, closedCount);

          while (createdAt >= next) {
            const dataPoint = {
              date: new Date(next),
              count,
              closedCount: closeCountTotal,
              openCount: count - closeCountTotal,
            };

            data.push(dataPoint);
            next += interval;
          }

          if (closedAt) {
            // issue has a close date, be sure to track it in the "pending" list
            const insertPos = _.sortedIndex(pendingCloses, closedAt);
            pendingCloses.splice(insertPos, 0, closedAt);
          } else {
            // the issue has not yet been closed, indicate that by pushing
            // null to the end of the pendingCloses list, which will always
            // stay there
            pendingCloses.push(null);
          }
        });
      return data;
    });
  }

  static getRelatedCommitDataOwnershipRiver(issue) {
    return {};
  }
}
