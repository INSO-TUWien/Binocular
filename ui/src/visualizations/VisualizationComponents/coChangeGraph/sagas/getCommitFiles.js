'use strict';

import { graphQl } from '../../../../utils';

/**
 * Gets all files with their respective commits
 * @returns {*} (see below)
 */
export default function getCommitFiles() {
  return graphQl
    .query(
      `{
        commitsFiles: commits {
          data {
              sha
              files {
                data {
                  file {
                    path
                  }
                }
              }
          }
        }
      }`,
    )
    .then((resp) => ({
      commitsFiles: resp.commitsFiles.data
    }));
};


/*
 .query(
      `{
        commitsFiles: files {
          data {
              path
              commits {
                data {
                  sha
                }
              }
          }
        }
      }`,
    )
    */