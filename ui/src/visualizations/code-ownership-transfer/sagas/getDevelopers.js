'use strict';

import {graphQl, traversePages} from "../../../utils";
import {Developer} from "../../../../../foxx/types/developer";

export const arrayOfDev = [];

export const getCommitsPage = (page, perPage) => {
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
      {page, perPage}
    )
    .then(resp => resp.commits);
};


export default function getDevelopers() {

  const dataDev = [];
  const nameDev = [];
  traversePages(getCommitsPage, commit => {

    if (!nameDev.includes(commit.signature)) {
      let tempDev = new Developer(commit.signature, 1);
      dataDev.push(tempDev);
      nameDev.push(commit.signature);
    } else {
      for (let i = 0; i < dataDev.length; i++) {
        if (dataDev[i].name === commit.signature) {
          dataDev[i].numOfCommits++;
        }
      }
    }
  }).then(function () {
    if (arrayOfDev.length !== dataDev.length) {
      for (let i = 0; i < dataDev.length; i++) {
        arrayOfDev.push(dataDev[i]);
      }
    }
    console.log('global dev array:', arrayOfDev);
  });

}


