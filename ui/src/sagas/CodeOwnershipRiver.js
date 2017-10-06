'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, throttle, fork, put, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

import { fetchFactory, timestampedActionFactory, mapSaga } from './utils.js';
import { getChartColors } from '../utils.js';
import moment from 'moment';

export const setShowIssues = createAction('SET_SHOW_ISSUES', b => b);
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE', i => i);
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE', i => i);

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');
export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');

const graphQl = new Lokka({ transport: new Transport('/graphQl') });

export default function*() {
  // fetch data once on entry
  yield* fetchCodeOwnershipData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);
  // keep looking for viewport changes to re-fetch
  yield fork(watchViewport);
  yield fork(watchRefresh);
}

function* watchRefreshRequests() {
  yield throttle(500, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

function* watchViewport() {
  yield takeEvery('COR_SET_VIEWPORT', mapSaga(requestRefresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchCodeOwnershipData);
}

export const fetchCodeOwnershipData = fetchFactory(
  function*() {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue
      ? Date.parse(firstIssue.createdAt)
      : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const { codeOwnershipConfig: { viewport = [0, null] } } = yield select();

    const firstSignificantTimestamp = Math.max(
      viewport[0],
      Math.min(firstCommitTimestamp, firstIssueTimestamp)
    );
    const lastSignificantTimestamp =
      viewport[1] || Math.max(lastCommitTimestamp, lastIssueTimestamp);

    const span = lastSignificantTimestamp - firstSignificantTimestamp;
    const granularity = getGranularity(span);

    const interval = moment.duration(1, granularity.unit).asMilliseconds();

    return yield Promise.join(
      getCommitData(
        [firstCommitTimestamp, lastCommitTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
        granularity,
        interval
      ),
      getIssueData(
        [firstIssueTimestamp, lastIssueTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
        granularity,
        interval
      )
    )
      .spread((commits, issues) => {
        return { commits, committers, palette: getChartColors('spectral', committers), issues };
      })
      .catch(function(e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);

function getCommitData(commitSpan, significantSpan, granularity, interval) {
  const statsByAuthor = {};
  const data = [
    {
      date: new Date(commitSpan[0]),
      count: 0,
      additions: 0,
      deletions: 0,
      totalStats: {}
    }
  ];

  let count = 0,
    additions = 0,
    deletions = 0;

  let next = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();

  return traversePages(
    getCommitsPage(significantSpan[1]),
    commit => {
      const dt = Date.parse(commit.date);

      let stats = statsByAuthor[commit.signature];
      if (!stats) {
        stats = statsByAuthor[commit.signature] = {
          count: 0,
          additions: 0,
          deletions: 0,
          changes: 0
        };
      }

      count++;
      additions += commit.stats.additions;
      deletions += commit.stats.deletions;

      stats.count++;
      stats.additions += commit.stats.additions;
      stats.deletions += commit.stats.deletions;
      stats.changes += commit.stats.additions + commit.stats.deletions;

      while (dt >= next) {
        const dataPoint = {
          date: new Date(next),
          count,
          additions,
          deletions,
          changes: additions + deletions,
          totalStats: _.cloneDeep(statsByAuthor)
        };

        data.push(dataPoint);
        next += interval;
      }
    },
    () => {}
  ).then(function() {
    data.push({
      date: new Date(commitSpan[1]),
      count,
      additions,
      deletions,
      changes: additions + deletions,
      totalStats: _.cloneDeep(statsByAuthor)
    });

    return data;
  });
}

function getIssueData(issueSpan, significantSpan, granularity, interval) {
  // holds close dates of still open issues, kept sorted at all times
  const pendingCloses = [];

  // issues closed so far
  let closeCountTotal = 0,
    count = 0;

  let next = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();
  const data = [
    {
      date: new Date(issueSpan[0]),
      count: 0,
      openCount: 0,
      closedCount: 0
    }
  ];

  return traversePages(
    getIssuesPage(significantSpan[1]),
    issue => {
      const createdAt = Date.parse(issue.createdAt);
      const closedAt = issue.closedAt ? Date.parse(issue.closedAt) : null;

      count++;

      // the number of closed issues at the issue's creation time, since
      // the last time we increased closedCountTotal
      let closedCount = _.sortedIndex(pendingCloses, createdAt);
      closeCountTotal += closedCount;

      // remove all issues that are closed by now from the "pending" list
      pendingCloses.splice(0, closedCount);

      while (createdAt >= next) {
        const dataPoint = {
          date: new Date(next),
          count,
          closedCount: closeCountTotal,
          openCount: count - closeCountTotal
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
    },
    () => {}
  ).then(() => data);
}

const getIssuesPage = until => (page, perPage) => {
  return graphQl
    .query(
      `
    query($page: Int, $perPage: Int, $until: Timestamp) {
      issues(page: $page, perPage: $perPage, until: $until) {
        count
        page
        perPage
        count
        data {
          title
          createdAt
          closedAt
        }
      }
    }`,
      { page, perPage, until }
    )
    .then(resp => resp.issues);
};

const getCommitsPage = until => (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int, $until: Timestamp) {
             commits(page: $page, perPage: $perPage, until: $until) {
               count
               page
               perPage
               data {
                 sha
                 date
                 messageHeader
                 signature
                 stats {
                   additions
                   deletions
                 }
               }
             }
          }`,
      { page, perPage, until }
    )
    .then(resp => resp.commits);
};

function traversePages(getPage, fn, countFn, pageNumber = 1, perPage = 100) {
  return getPage(pageNumber, perPage).then(page => {
    countFn(page.count);
    _.each(page.data, fn);
    if (page.data.length + (page.page - 1) * page.perPage < page.count) {
      return traversePages(getPage, fn, () => null, pageNumber + 1, perPage);
    }
  });
}

function getGranularity(span) {
  const granularities = [
    { unit: 'year', limit: moment.duration(100, 'years') },
    { unit: 'month', limit: moment.duration(100, 'months') },
    { unit: 'week', limit: moment.duration(100, 'weeks') },
    { unit: 'day', limit: moment.duration(100, 'day') },
    { unit: 'hour', limit: moment.duration(100, 'hour') }
  ];

  return _.reduce(granularities, (t, g) => {
    if (span < g.limit.asMilliseconds()) {
      return g;
    } else {
      return t;
    }
  });
}

function getBounds() {
  return graphQl
    .query(
      `{
         committers
         firstCommit: commits( perPage: 1, sort: "ASC" ) {
           data {
             date
             stats { additions deletions }
           }
         }
         lastCommit: commits( perPage: 1, sort: "DESC" ) {
           data {
             date
             stats { additions deletions }
           }
         },
         firstIssue: issues( perPage: 1, sort: "ASC" ) {
           data {
             createdAt
             closedAt
           }
         },
         lastIssue: issues( perPage: 1, sort: "DESC" ) {
           data {
             createdAt
             closedAt
           }
         }
       }`
    )
    .then(resp => ({
      firstCommit: resp.firstCommit.data[0],
      lastCommit: resp.lastCommit.data[0],
      firstIssue: resp.firstIssue.data[0],
      lastIssue: resp.lastIssue.data[0],
      committers: resp.committers
    }));
}
