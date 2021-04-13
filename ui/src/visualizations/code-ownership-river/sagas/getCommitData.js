'use strict';

import moment from 'moment';
import _ from 'lodash';
import { traversePages, graphQl } from '../../../utils';

export default function getCommitData(commitSpan, significantSpan, granularity, interval) {
  const statsByAuthor = {};

  const totals = {
    count: 0,
    additions: 0,
    deletions: 0,
    changes: 0
  };

  const data = [
    {
      date: new Date(commitSpan[0]),
      totals: _.cloneDeep(totals),
      statsByAuthor: {}
    }
  ];

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
        statsByAuthor: _.cloneDeep(statsByAuthor)
      };

      data.push(dataPoint);
      next += interval;
    }
  }).then(function() {
    data.push({
      date: new Date(commitSpan[1]),
      totals: _.cloneDeep(totals),
      statsByAuthor: _.cloneDeep(statsByAuthor)
    });

    return group(data);
  });
}

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
      changes: 0
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
      groupedCommitters
    };
  };

  const { groupedCommitters } = applyGroupBy(lastDatum.statsByAuthor, stats => {
    return stats.count <= threshhold;
  });

  _.each(data, datum => {
    const { groupedStats } = applyGroupBy(datum.statsByAuthor, (stats, author) => _.includes(groupedCommitters, author));

    datum.statsByAuthor = groupedStats;
  });

  return data;
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
