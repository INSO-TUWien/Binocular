'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import moment from 'moment/moment';
import _ from 'lodash';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}\/.*`) } },
  });
}

export default class Issues {
  static getIssueData(db, issueSpan, significantSpan) {
    // return all issues, filtering according to parameters can be added in the future
    return findAll(db, 'issues').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((i) => new Date(i.createdAt) >= new Date(significantSpan[0]) && new Date(i.createdAt) <= new Date(significantSpan[1]));
      return res.docs;
    });
  }

  static getIssueDataOwnershipRiver(db, issueSpan, significantSpan, granularity, interval) {
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
    return findAll(db, 'issues').then((res) => {
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
}
