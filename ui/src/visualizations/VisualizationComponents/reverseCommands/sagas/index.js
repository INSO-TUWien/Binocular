'use strict';

import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../../sagas/utils';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import { createAction } from 'redux-actions';
import chroma from 'chroma-js';
import _ from 'lodash';
import Database from '../../../../database/database';

export const setSelectedAuthors = createAction('SET_SELECTED_AUTHORS');
export const setDisplayMetric = createAction('SET_DISPLAY_METRIC');
export const requestReverseCommandsData = createAction('REQUEST_REVERSE_COMMANDS_DATA');
export const receiveReverseCommandsData = timestampedActionFactory('RECEIVE_REVERSE_COMMANDS_DATA');
export const receiveReverseCommandsDataError = createAction('RECEIVE_CHANGES_DATA_ERROR');

export const setActiveBranch = createAction('SET_ACTIVE_BRANCH', (b) => b);
export const setActiveBranches = createAction('SET_ACTIVE_BRANCHES', (b) => b);
export const setSelectedBranches = createAction('SET_SELECTED_BRANCHES', (b) => b);
export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function* () {
  // fetch data once on entry
  yield* fetchReverseCommandsData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  // keep looking for viewport changes to re-fetch
  yield fork(watchRefresh);
  yield fork(watchToggleHelp);

  // keep looking for universal settings changes
  yield fork(watchTimeSpan);
  yield fork(watchSelectedAuthorsGlobal);
  yield fork(watchMergedAuthors);
  yield fork(watchOtherAuthors);

  //branch settings
  yield fork(watchSetActiveBranch);
  yield fork(watchSetActiveBranches);
  yield fork(watchSetSelectedBranches);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchReverseCommandsData);
}

function* watchSelectedAuthorsGlobal() {
  yield takeEvery('SET_SELECTED_AUTHORS_GLOBAL', fetchReverseCommandsData);
}

function* watchOtherAuthors() {
  yield takeEvery('SET_OTHER_AUTHORS', fetchReverseCommandsData);
}

function* watchMergedAuthors() {
  yield takeEvery('SET_MERGED_AUTHORS', fetchReverseCommandsData);
}

function* watchRefreshRequests() {
  yield throttle(5000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchReverseCommandsData);
}

function* watchSetActiveBranch() {
  yield takeEvery('SET_ACTIVE_BRANCH', mapSaga(requestRefresh));
}

function* watchSetActiveBranches() {
  yield takeEvery('SET_ACTIVE_BRANCHES', mapSaga(requestRefresh));
}

function* watchSetSelectedBranches() {
  yield takeEvery('SET_SELECTED_BRANCHES', mapSaga(requestRefresh));
}

/**
 * Fetch data for dashboard, this still includes old functions that were copied over.
 */
export const fetchReverseCommandsData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield Database.getBounds();
    const firstCommitTimestamp = Date.parse(firstCommit.date);
    const lastCommitTimestamp = Date.parse(lastCommit.date);

    const firstIssueTimestamp = firstIssue ? Date.parse(firstIssue.createdAt) : firstCommitTimestamp;
    const lastIssueTimestamp = lastIssue ? Date.parse(lastIssue.createdAt) : lastCommitTimestamp;

    const state = yield select();
    const branch = state.visualizations.reverseCommands.state.config.branches;
    const selectedBranches = state.visualizations.reverseCommands.state.config.selectedBranches;
    console.log('saga-branch: ', branch);
    console.log('selected-branches in saga: ', selectedBranches);
    const branches = state.visualizations.reverseCommands.state.config.branches;
    const viewport = state.visualizations.reverseCommands.state.config.viewport || [0, null];

    let firstSignificantTimestamp = Math.max(viewport[0], Math.min(firstCommitTimestamp, firstIssueTimestamp));
    let lastSignificantTimestamp = viewport[1] ? viewport[1].getTime() : Math.max(lastCommitTimestamp, lastIssueTimestamp);
    const timeSpan = state.universalSettings.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();
    return yield Promise.all([
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstSignificantTimestamp, lastSignificantTimestamp]),
      Database.getCommitData([firstCommitTimestamp, lastCommitTimestamp], [firstCommitTimestamp, lastCommitTimestamp]),
    ])
      .then((result) => {
        const commits = result[1];
        let filteredCommits;

        // initially load whole repo, then filter once branches are selected
        if (selectedBranches.length !== 0) {
          filteredCommits = filterCommits(commits, selectedBranches);
        } else {
          filteredCommits = commits;
        }
        return {
          otherCount: 0,
          filteredCommits,
          commits,
          committers,
          firstCommitTimestamp,
          lastCommitTimestamp,
          firstSignificantTimestamp,
          lastSignificantTimestamp,
          branch,
          branches,
          selectedBranches,
        };
      })
      .catch(function (e) {
        console.error(e.stack);
        throw e;
      });
  },
  requestReverseCommandsData,
  receiveReverseCommandsData,
  receiveReverseCommandsDataError
);

function filterCommits(commits, branchNames) {
  const filteredCommits = commits.filter((commit) => branchNames.includes(commit.branch));
  console.log('how much did i filter: ', filteredCommits.length);
  return filteredCommits;
}
