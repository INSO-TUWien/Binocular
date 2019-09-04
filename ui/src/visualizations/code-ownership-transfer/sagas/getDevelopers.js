'use strict';

import {graphQl, traversePages} from "../../../utils";

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
    .then(resp =>  resp.commits);
};


export default function getDevelopers() {

  const dataDev = [];
  traversePages(getCommitsPage, commit => {
    if(!dataDev.includes(commit.signature)) {
      dataDev.push(commit.signature);
    }
  }).then(function () {
    if(arrayOfDev.length !== dataDev.length) {
      for (let i = 0; i < dataDev.length; i++) {
        arrayOfDev.push(dataDev[i]);
      }
    }
    console.log('global dev array:', arrayOfDev);
  });

}
