'use strict';

import { createAction } from 'redux-actions';

import { collectPages, graphQl } from '../../../utils';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';

export default fetchFactory(
  function*(filename, perPage){
    return yield getRelatedCommits(filename, perPage);
  },
  getRelatedCommits
);


function getRelatedCommits(filename, perPage){
  return graphQl
    .query(
      `query commitsForSpecificFile($filename: String!, $perPage: Int) {
        file(path: $filename) {
          id
          path
          commits(page: 1, perPage: $perPage) {
            data {
              date
              files {
                data {
                  file {
                    path
                  }
                  stats {
                    additions
                    deletions
                  }
                }
              }
            }
          }
        }
      }`,
      { filename, perPage }
    )
    .then(resp => {return resp});
};