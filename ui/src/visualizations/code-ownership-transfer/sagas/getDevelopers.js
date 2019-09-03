'use strict';

import {graphQl, traversePages} from "../../../utils";



const getCommitsPage = (page, perPage) => {
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
  return traversePages(getCommitsPage, commit => {
    if(!dataDev.includes(commit.signature)) {
      dataDev.push(commit.signature);
      console.log('OUR DEVELOPERS', dataDev);
    }
  });


}
