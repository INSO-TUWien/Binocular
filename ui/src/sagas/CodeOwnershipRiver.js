'use strict';

import { createAction } from 'redux-actions';
import { reachGraphQL } from 'react-reach';
import { select } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory } from './utils.js';

export const setShowIssues = createAction('SET_SHOW_ISSUES', b => b);
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE', i => i);
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE', i => i);

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');

export const fetchCodeOwnershipData = fetchFactory(
  function*() {
    const { graphQl } = yield select();

    if (!graphQl) {
      console.warn('GraphQL not yet initialized!');
      return;
    }

    const DATA_POINT_COUNT = 50;
    let count = 0, additions = 0, deletions = 0;
    const data = [];

    const [first, last] = yield getCommitTimeSpan(graphQl);
    const span = last - first;
    const interval = Math.floor(span / DATA_POINT_COUNT);
    let next = first + interval;
    const statsByAuthor = {};

    return yield traversePages(
      getCommitsPage,
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

        if (dt >= next) {
          data.push({
            date: new Date(next),
            count,
            additions,
            deletions,
            totalStats: _.cloneDeep(statsByAuthor)
          });
          next += interval;
        }
      },
      () => {}
    )
      .then(() => ({ commits: data }))
      .catch(function(e) {
        console.warn(e);
        throw e;
      });

    function getCommitsPage(page, perPage) {
      return graphQl
        .query(
          `query($page: Int, $perPage: Int) {
             commits(page: $page, perPage: $perPage) {
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
          { page, perPage }
        )
        .then(resp => resp.commits);
    }
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);

function traversePages(getPage, fn, countFn, pageNumber = 1, perPage = 50) {
  return getPage(pageNumber, perPage).then(page => {
    countFn(page.count);
    _.each(page.data, fn);
    if (page.data.length + (page.page - 1) * page.perPage < page.count) {
      return traversePages(getPage, fn, () => null, pageNumber + 1, perPage);
    }
  });
}

function getCommitTimeSpan(graphQl) {
  return graphQl
    .query(
      `{
         first: commits( perPage: 1, sort: "ASC" ) {
           data { date }
         }
         last: commits( perPage: 1, sort: "DESC" ) {
           data { date }
         }
       }`
    )
    .then(resp => [resp.first.data[0].date, resp.last.data[0].date].map(s => Date.parse(s)));
}
