'use strict';

import { createAction } from 'redux-actions';
import { fork, takeEvery, throttle } from 'redux-saga/effects';
import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../sagas/utils';
import getCommits from './getCommits';
import test from './calculateFigures';

export const setActivityScale = createAction('SET_TEAM_AWARENESS_ACTIVITY_SCALE');
export const setActivityDimensions = createAction('SET_TEAM_AWARENESS_ACTIVITY_DIMENSIONS');

export const processTeamAwarenessData = timestampedActionFactory('PROCESS_TEAM_AWARENESS_DATA');
export const requestTeamAwarenessData = createAction('REQUEST_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessData = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessDataError = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function*() {
  yield fork(watchDataReceive);
  yield fork(watchActivityDimensionsSet);
  yield fork(watchRefreshRequests);
  yield fork(watchMessages);
  yield fork(watchRefresh);

  yield* fetchAwarenessData();
}

function* watchDataReceive() {
  yield takeEvery('RECEIVE_TEAM_AWARENESS_DATA', test);
}

function* watchActivityDimensionsSet() {
  yield takeEvery('SET_TEAM_AWARENESS_ACTIVITY_DIMENSIONS', test);
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
    return yield Promise.all([getCommits()]).then(result => {
      return {
        commits: result[0]
      };
    });
  },
  requestTeamAwarenessData,
  receiveTeamAwarenessData,
  receiveTeamAwarenessDataError
);
