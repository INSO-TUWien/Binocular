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
            signature
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
      const contributors = new Map();
      let fileTree = {};
      for (let i = 0; i < resp.commits.data.length; i++) {
        const commit = resp.commits.data[i];
        if (!contributors.has(commit.signature)) {
          contributors.set(commit.signature, contributors.size + 1);
        }
        fileTree = applyCommit(fileTree, commit, i, contributors.get(commit.signature));
        fileTreeHistory.push(fileTree);
      }
      return {
        fileTreeHistory,
        commits: resp.commits.data,
        contributors: contributors
      };
    });
  },
  requestFileTreeEvolutionData,
  receiveFileTreeEvolutionData,
  receiveFileTreeEvolutionDataError
);

function applyCommit(fileTree, commit, commitIndex, contributor) {
  fileTree = structuredClone(fileTree)
  for (const file of commit.files.data) {
    const path = file.file.path.split('/');
    modifyFile(fileTree, path, file, commitIndex, contributor);
  }
  return fileTree;
}

function modifyFile(fileTree, path, file, commitIndex, contributor, prevPath = '', parentPaths = []) {
  if (path.length === 0) {
    fileTree.size = file.lineCount;
    fileTree.contributor = contributor;
    fileTree.changeIteration = commitIndex;
  } else {
    const fullPath = !prevPath ? path[0] : prevPath + '/' + path[0]
    if (!fileTree.children) {
      fileTree.children = [];
      fileTree.childIndexMap = {};
    }
    if (fileTree.childIndexMap[path[0]] == null) {
      fileTree.children.push({
        name: path[0],
        creationIteration: commitIndex,
        fullPath: fullPath,
        parentPaths: parentPaths
      });
      fileTree.childIndexMap[path[0]] = fileTree.children.length - 1;
    }
    modifyFile(
      fileTree.children[fileTree.childIndexMap[path[0]]], 
      path.slice(1), 
      file, 
      commitIndex, 
      contributor,
      fullPath,
      [fullPath, ...parentPaths]
    );
  }
}