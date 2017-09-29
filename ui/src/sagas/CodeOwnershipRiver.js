'use strict';

import { createAction } from 'redux-actions';
import { select, throttle, fork } from 'redux-saga/effects';
import _ from 'lodash';
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

import { fetchFactory, timestampedActionFactory } from './utils.js';
import { getChartColors } from '../utils.js';
import moment from 'moment';

export const setShowIssues = createAction('SET_SHOW_ISSUES', b => b);
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE', i => i);
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE', i => i);

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');
export const setViewport = createAction('COR_SET_VIEWPORT');

const graphQl = new Lokka({ transport: new Transport('/graphQl') });

export default function*() {
  // fetch data once on entry
  yield* fetchCodeOwnershipData();

  // keep looking for viewport changes to re-fetch
  yield fork(watchViewport);
}

function* watchViewport() {
  yield throttle(500, 'COR_SET_VIEWPORT', fetchCodeOwnershipData);
}

export const fetchCodeOwnershipData = fetchFactory(
  function*() {
    let count = 0,
      additions = 0,
      deletions = 0;

    const { firstCommit, lastCommit, committers } = yield getCommitInfo();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const { codeOwnershipConfig: { viewport = [null, null] } } = yield select();

    const firstSignificantTimestamp = viewport[0] || firstCommitTimestamp;
    const lastSignificantTimestamp = viewport[1] || lastCommitTimestamp;

    const span = lastSignificantTimestamp - firstSignificantTimestamp;
    const granularity = getGranularity(span);

    const interval = moment.duration(1, granularity.unit).asMilliseconds();
    let next = moment(firstSignificantTimestamp).startOf(granularity.unit).toDate().getTime();

    const statsByAuthor = {};
    const data = [
      {
        date: new Date(firstCommitTimestamp),
        count: 0,
        additions: 0,
        deletions: 0,
        totalStats: {}
      }
    ];

    return yield traversePages(
      getCommitsPage(lastSignificantTimestamp),
      commit => {
        const dt = Date.parse(commit.date);

        let stats = statsByAuthor[commit.signature];
        if (!stats) {
          stats = statsByAuthor[commit.signature] = {
            count: 0,
            additions: 0,
            deletions: 0
          };
        }

        count++;
        additions += commit.stats.additions;
        deletions += commit.stats.deletions;

        stats.count++;
        stats.additions += commit.stats.additions;
        stats.deletions += commit.stats.deletions;

        while (dt >= next) {
          const dataPoint = {
            date: new Date(dt),
            count,
            additions,
            deletions,
            totalStats: _.cloneDeep(statsByAuthor)
          };

          data.push(dataPoint);
          next += interval;
        }
      },
      () => {}
    )
      .then(function() {
        data.push({
          date: new Date(lastCommitTimestamp),
          count,
          additions,
          deletions,
          totalStats: _.cloneDeep(statsByAuthor)
        });

        return { commits: data, palette: getChartColors('spectral', committers) };
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

function getCommitInfo() {
  return graphQl
    .query(
      `{
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
         }
         committers
       }`
    )
    .then(resp => ({
      firstCommit: resp.firstCommit.data[0],
      lastCommit: resp.lastCommit.data[0],
      committers: resp.committers
    }));
}
