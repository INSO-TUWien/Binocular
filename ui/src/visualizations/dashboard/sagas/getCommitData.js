'use strict';

import moment from 'moment';
import _ from 'lodash';
import { traversePages, graphQl } from '../../../utils';

/**
 * Get commit data from the database.
 * @param commitSpan Array of two time values (ms), first commit and last commit.
 * @param significantSpan Array of two time values (ms), first significant and last significant commit
 * (only these will actually be returned, used for zooming, the rest of the time will be empty data).
 * @param granularity Influences how many data points will be aggregated into a single point (hours, days, weeks, months, years). See sagas/index.js for granularities.
 * @param interval Interval in milliseconds derived from the granularity.
 * @returns {*}
 */
export default function getCommitData(commitSpan, significantSpan, granularity, interval) {
  const statsByAuthor = {};

  const totals = {
    count: 0,
    additions: 0,
    deletions: 0,
    changes: 0
  };

  const data = [];

  let commitList = [];

  return traversePages(getCommitsPage(significantSpan[1]), commit => {
    commitList.push(commit);
  }).then(function() {
    let curr = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();
    let next = curr + interval;
    let debug = commitList;
    for(let i=0; curr < significantSpan[1]; curr = next, next += interval){       //Iterate through time buckets
      let obj = {date: curr, totals: {count: 0, changes: 0}, statsByAuthor: {}};  //Save date of time bucket, create object
      for(; i < commitList.length && Date.parse(commitList[i].date) < next; i++){             //Iterate through commits that fall into this time bucket
        let changes = commitList[i].stats.additions + commitList[i].stats.deletions;
        let commitAuthor = commitList[i].signature;
        obj.totals.count++;
        obj.totals.changes += changes;
        if(commitAuthor in obj.statsByAuthor)                                     //If author is already in statsByAuthor, add to previous values
          obj.statsByAuthor[commitAuthor] = {count: obj.statsByAuthor[commitAuthor].count+1, changes: obj.statsByAuthor[commitAuthor].changes + changes};
        else                                                                      //Else create new values
          obj.statsByAuthor[commitAuthor] = {count: 1, changes: changes};

      }
      data.push(obj);
    }

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
