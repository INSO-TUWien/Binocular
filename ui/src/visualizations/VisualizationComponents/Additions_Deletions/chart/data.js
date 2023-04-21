'use strict';

import { traversePages, graphQl } from '../../../../utils';
import chroma from 'chroma-js';
import _ from 'lodash';

export default class Data {
  static async fetchData() {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = await this.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const commitData = await this.request([firstCommitTimestamp, lastCommitTimestamp]);
    const palette = this.getPalette(commitData, 15, committers.length);

    return { commitData, palette };
  }

  static request(significantSpan) {
    const commitList = [];
    const getCommitsPage = (until) => (page, perPage) => {
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
        .then((resp) => resp.commits);
    };

    return traversePages(getCommitsPage(significantSpan[1]), (commit) => {
      commitList.push(commit);
    }).then(function () {
      return commitList;
    });
  }

  /**
   * Get first and last commit, as well as first and last issue
   * @returns {*} (see below)
   */
  static getBounds() {
    return Promise.resolve(
      graphQl
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
        .then((resp) => ({
          firstCommit: resp.firstCommit.data[0],
          lastCommit: resp.lastCommit.data[0],
          firstIssue: resp.firstIssue.data[0],
          lastIssue: resp.lastIssue.data[0],
          committers: resp.committers,
        }))
    );
  }

  static getPalette(commits, maxNumberOfColors, numOfCommitters) {
    function chartColors(band, maxLength, length) {
      const len = length > maxLength ? maxLength : length;
      return chroma.scale(band).mode('lch').colors(len);
    }

    const palette = chartColors('spectral', 15, numOfCommitters);

    const totals = {};
    _.each(commits, (commit) => {
      const changes = commit.stats.additions + commit.stats.deletions;
      if (totals[commit.signature]) {
        totals[commit.signature] += changes;
      } else {
        totals[commit.signature] = changes;
      }
    });

    const sortable = [];
    _.each(Object.keys(totals), (key) => {
      sortable.push([key, totals[key]]);
    });

    sortable.sort((a, b) => {
      return b[1] - a[1];
    });

    const returnPalette = {};

    for (let i = 0; i < palette.length - 1; i++) {
      returnPalette[sortable[i][0]] = palette[i];
    }
    if (sortable.length > maxNumberOfColors) {
      returnPalette['others'] = palette[maxNumberOfColors - 1];
    } else if (sortable.length <= maxNumberOfColors) {
      returnPalette[sortable[sortable.length - 1][0]] = palette[palette.length - 1];
    }

    return returnPalette;
  }
}
