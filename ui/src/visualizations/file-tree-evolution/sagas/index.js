'use strict';

import { createAction } from 'redux-actions';
import _ from 'lodash';
import moment from 'moment';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';
import { graphQl } from '../../../utils';
import { path } from 'd3';

export const requestFileTreeEvolutionData = createAction('REQUEST_FILE_TREE_EVOLUTION_DATA');
export const receiveFileTreeEvolutionData = timestampedActionFactory('RECEIVE_FILE_TREE_EVOLUTION_DATA');
export const receiveFileTreeEvolutionDataError = createAction('RECEIVE_FILE_TREE_EVOLUTION_DATA_ERROR');

export default function*() {
  // fetch data once on entry
  yield* fetchFileTreeEvolutionData();
}

export const fetchFileTreeEvolutionData = fetchFactory(
  function*() {
    return yield graphQl.query(
      `{  
        commits(sort: "ASC") {
          data {
            date
            message
            files {
              data {
                stats {
                  additions
                  deletions
                }
                file {
                  path,
                }
                lineCount
              }
            }
          }
        }
      }`
    )
    .then(resp => {
      const fileTreeHistory = [];
      let fileTree = {};
      for (const commit of resp.commits.data) {
        fileTree = applyCommit(fileTree, commit);
        fileTreeHistory.push(fileTree);
      }
      return {
        fileTreeHistory,
        commits: resp.commits.data
      };
    });
  },
  requestFileTreeEvolutionData,
  receiveFileTreeEvolutionData,
  receiveFileTreeEvolutionDataError
);

function applyCommit(fileTree, commit) {
  fileTree = structuredClone(fileTree)
  for (const file of commit.files.data) {
    const path = file.file.path.split('/');
    modifyFile(fileTree, path, file);
  }
  return fileTree;
}

function modifyFile(fileTree, path, file) {
  if (path.length === 0) {
    fileTree.size = file.lineCount;
  } else {
    if (!fileTree.children) {
      fileTree.children = {};
    }
    if (!fileTree.children[path[0]]) {
      fileTree.children[path[0]] = {
        name: path[0]
      };
    }
    modifyFile(fileTree.children[path[0]], path.slice(1), file);
  }
}