'use strict';

import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils';
import { createAction } from 'redux-actions';
import Database from '../../../../database/database';

export const requestCommitsAndFileTree = createAction('REQUEST_COMMITS');
export const receiveCommitsAndFileTree = timestampedActionFactory('RECEIVE_COMMITS');
export const receiveCommitsAndFileTreeError = createAction('RECEIVE_COMMITS');
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

    const commits = yield Database.getCommitsWithFileTree([firstCommitTimestamp, lastCommitTimestamp], [firstCommitTimestamp, lastCommitTimestamp]); //COMMITS
    //const fileTree = yield Database.requestFileStructure();
    //console.log(yield Database.searchCommits('Bug')); //search commits

    //let fileTreeInTimeSpan = buildTimespanSpecificFileTree(null, commits[100].sha, commits);
    //console.log(fileTreeInTimeSpan);
    //const h = makeHierarchyFileTree(fileTreeInTimeSpan);
    //console.log(h);

    return { commits: commits, tree: null };
  },
  requestCommitsAndFileTree,
  receiveCommitsAndFileTree,
  receiveCommitsAndFileTreeError
);






