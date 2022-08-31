'use strict';

import { createAction } from 'redux-actions';
import { fork, takeEvery, throttle } from 'redux-saga/effects';
import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../sagas/utils';
import getCommits from './getCommits';
import calculateGraphFigures from './calculateFigures';
import getBranches from './getBranches';
import getFiles from './getFiles';
import { generateFileBrowser } from './fileTreeOperations';
import { processConflictBranchSelection } from './conflictCalculations';

export const setActivityScale = createAction('SET_TEAM_AWARENESS_ACTIVITY_SCALE');
export const setActivityDimensions = createAction('SET_TEAM_AWARENESS_ACTIVITY_DIMENSIONS');
export const setBranch = createAction('SET_TEAM_AWARENESS_BRANCH');
export const setConflictBranch = createAction('SET_TEAM_AWARENESS_CONFLICT_BRANCH');
export const setFilteredFiles = createAction('SET_TEAM_AWARENESS_FILTERED_FILES');
export const setFileFilterMode = createAction('SET_TEAM_AWARENESS_FILE_FILTER_MODE');
export const setConflictPartners = createAction('SET_TEAM_AWARENESS_CONFLICT_PARTNERS');

export const processTeamAwarenessData = timestampedActionFactory('PROCESS_TEAM_AWARENESS_DATA');
export const processTeamAwarenessFileBrowser = timestampedActionFactory('PROCESS_TEAM_AWARENESS_FILE_BROWSER');
export const requestTeamAwarenessData = createAction('REQUEST_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessData = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessDataError = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA_ERROR');

export const startTeamAwarenessConflictProcessing = createAction('START_TEAM_AWARENESS_CONFLICT_PROCESSING');
export const receiveTeamAwarenessConflicts = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_CONFLICTS');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function*() {
  yield fork(invokeAllDataGenerators('RECEIVE_TEAM_AWARENESS_DATA'));
  yield fork(invokeAllDataGenerators('SET_TEAM_AWARENESS_ACTIVITY_SCALE'));
  yield fork(invokeAllDataGenerators('SET_TEAM_AWARENESS_BRANCH'));
  yield fork(invokeAllDataGenerators('SET_TEAM_AWARENESS_ACTIVITY_DIMENSIONS'));
  yield fork(invokeAllDataGenerators('SET_TEAM_AWARENESS_FILTERED_FILES'));
  yield fork(invokeAllDataGenerators('SET_TEAM_AWARENESS_FILE_FILTER_MODE'));
  yield fork(watchRefreshRequests);
  yield fork(watchMessages);
  yield fork(watchRefresh);
  yield fork(watchConflictBranch);

  yield* fetchAwarenessData();
}

const invokeAllDataGenerators = action => {
  return function*() {
    yield takeEvery(action, calculateGraphFigures);
    yield takeEvery(action, generateFileBrowser);
  };
};

function* watchConflictBranch() {
  yield takeEvery('SET_TEAM_AWARENESS_CONFLICT_BRANCH', processConflictBranchSelection);
  yield takeEvery('SET_TEAM_AWARENESS_BRANCH', processConflictBranchSelection);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchAwarenessData);
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

export const fetchAwarenessData = fetchFactory(
  function*() {
    //const state = getState(yield select());
    return yield Promise.all([getCommits(), getBranches(), getFiles()]).then(result => {
      return {
        commits: result[0],
        branches: result[1],
        files: result[2]
      };
    });
  },
  requestTeamAwarenessData,
  receiveTeamAwarenessData,
  receiveTeamAwarenessDataError
);
