'use strict';

import { createAction } from 'redux-actions';
import { fork, takeEvery, throttle } from 'redux-saga/effects';
import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../sagas/utils';
import getCommits from './getCommits';
import getStakeholders from './getStakeholders';

export const setSelectActivity = createAction('SET_SELECT_ACTIVITY');

export const requestTeamAwarenessData = createAction('REQUEST_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessData = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessDataError = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function*() {
  yield* fetchAwarenessData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);
  yield fork(watchRefresh);
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
    return yield Promise.all([getStakeholders(), getCommits()]).then(result => {
      return {
        stakeholders: result[0],
        activity: result[1]
      };
    });
  },
  requestTeamAwarenessData,
  receiveTeamAwarenessData,
  receiveTeamAwarenessDataError
);
