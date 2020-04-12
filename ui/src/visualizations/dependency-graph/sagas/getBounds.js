'use strict';

import { graphQl } from '../../../utils';

export default function getBounds() {
  return graphQl
    .query(
      `{
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
         }
       }`
    )
    .then(resp => ({
      firstCommit: resp.firstCommit.data[0],
      lastCommit: resp.lastCommit.data[0]
    }));
}
