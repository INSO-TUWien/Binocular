'use strict';

import moment from 'moment';
import _ from 'lodash';
import { traversePages, graphQl } from '../../../utils';

export default function getIssueData(issueSpan, significantSpan, granularity, interval) {
  let data = [];
  let issueList = [];

  return traversePages(getIssuesPage(significantSpan[1]), issue => {
    issueList.push(issue);
  }).then(function() {
    let curr = moment(significantSpan[0]).startOf(granularity.unit).toDate().getTime();
    let next = curr + interval;

    let sortedCloseDates = [];
    let createdDate = Date.parse(issueList[0].createdAt);
    for(let i=0, j=0; curr < significantSpan[1]; curr = next, next += interval){                   //Iterate through time buckets
      let obj = {date: curr, count: 0, openCount: 0, closedCount: 0};                            //Save date of time bucket, create object

      while(i < issueList.length && createdDate < next && createdDate >= curr){               //Iterate through issues that fall into this time bucket
        if(createdDate > curr && createdDate < next){
          obj.count++;
          obj.openCount++;
        }
        if(issueList[i].closedAt) {
          const closedDate = Date.parse(issueList[i].closedAt);
          const insertPos = _.sortedIndex(sortedCloseDates, closedDate);
          sortedCloseDates.splice(insertPos, 0, closedDate);
        }
        if(++i < issueList.length)
          createdDate = Date.parse(issueList[i].createdAt);
      }
      for(;j < sortedCloseDates.length && sortedCloseDates[j] < next && sortedCloseDates[j] >= curr; j++){               //Iterate through issues that fall into this time bucket
        if(sortedCloseDates[j] > curr && sortedCloseDates[j] < next){
          sortedCloseDates.splice(j,1);
          obj.count++;
          obj.closedCount++;
        }
      }
      data.push(obj);
    }

    return data;
  });
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
