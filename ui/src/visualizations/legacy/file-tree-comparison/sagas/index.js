'use strict';

import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils';
import { createAction } from 'redux-actions';
import Database from '../../../../database/database';

export const requestCommitsAndFileTree = createAction('REQUEST_COMMITS_AND_FILE_TREE');
export const receiveCommitsAndFileTree = timestampedActionFactory('RECEIVE_COMMITS_AND_FILE_TREE');
export const receiveCommitsAndFileTreeError = createAction('RECEIVE_COMMITS_AND_FILE_TREE_ERROR');
export const setCommit1 = createAction('SET_COMMIT_1', (f) => f);
export const setCommit2 = createAction('SET_COMMIT_2', (f) => f);

export default function* () {
  // fetch data once on entry
  yield* fetchFileTreeEvolutionData();
}

export const fetchFileTreeEvolutionData = fetchFactory(
  function* () {

    const { firstCommit, lastCommit } = yield Database.getBounds(); //getting first and last commit date
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const commits = yield Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstCommitTimestamp, lastCommitTimestamp]); //COMMITS
    const fileTree = yield Database.requestFileStructure();
    const hierarchicalFileTree = makeHierarchyFileTree(fileTree); //file-tree
    //console.log(yield Database.searchCommits('Bug')); //search commits

    return { commits: commits, tree: hierarchicalFileTree };
  },
  requestCommitsAndFileTree,
  receiveCommitsAndFileTree,
  receiveCommitsAndFileTreeError
);

function makeHierarchyFileTree(fileTree) {
  const result = [];
  const level = { result };

  fileTree.files.data.forEach((entry) => {
    entry.path.split('/').reduce((r, name) => {
      if (!r[name]) {
        r[name] = { result: [] };
        r.result.push({ name, children: r[name].result });
      }
      return r[name];
    }, level);
  });

  return result;
}
