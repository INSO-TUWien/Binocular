'use strict';

import moment from 'moment';
import _ from 'lodash';
import { traversePages, graphQl } from '../../../utils';

export default function getCommitData(commitSpan, significantSpan, granularity, interval) {
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

  return traversePages(getCommitsPage(significantSpan[1]), commit => {
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
  }).then(function() {
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
