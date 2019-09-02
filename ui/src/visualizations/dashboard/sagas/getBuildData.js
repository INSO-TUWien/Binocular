'use strict';

import moment from 'moment';
import _ from 'lodash';
import { traversePages, graphQl } from '../../../utils';

export default function getBuildData(buildSpan, significantSpan, granularity, interval) {
  let data = [];
  let buildList = [];

  return traversePages(getBuildsPage, build => {
    buildList.push(build);
  }).then(function() {
    let curr = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();
    let next = curr + interval;
    let debug = buildList;
    for(let i=0; curr < significantSpan[1]; curr = next, next += interval){       //Iterate through time buckets
      let obj = {date: curr, succeeded: 0, failed: 0};  //Save date of time bucket, create object
      for(; i < buildList.length && Date.parse(buildList[i].createdAt) < next; i++){             //Iterate through commits that fall into this time bucket
        let buildDate = Date.parse(buildList[i].createdAt);
        if(buildDate >= curr && buildDate < next){
          obj.succeeded += (buildList[i].stats.success || 0);
          obj.failed += (buildList[i].stats.failed || 0);
        }
      }
      data.push(obj);
    }
    return data;
  });
}

const getBuildsPage = (page, perPage) => {
  return graphQl
    .query(
      `
    query($page: Int, $perPage: Int) {
      builds(page: $page, perPage: $perPage) {
        count
        page
        perPage
        count
        data {
          id
          createdAt
          stats {
            success
            failed
            pending
            canceled
          }
        }
      }
    }`,
      { page, perPage }
    )
    .then(resp => resp.builds);
};
