'use strict';

import Promise from 'bluebird';
import {createAction} from 'redux-actions';
import {throttle, fork, takeEvery, select} from 'redux-saga/effects';


import {fetchFactory, timestampedActionFactory, mapSaga} from '../../../sagas/utils.js';

import fetchRelatedCommits from './fetchRelatedCommits.js';

import getDevelopers from "./getDevelopers";

export const setCategory = createAction('SET_CATEGORY');

export const setOverlay = createAction('SET_OVERLAY');
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE');
export const openCommit = createAction('OPEN_COMMIT');

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_TRANSFER_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_TRANSFER_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_TRANSFER_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');

export default function* () {
  // fetch data once on entry
  yield* fetchCodeOwnershipData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);

  yield fork(watchOpenCommit);

  // keep looking for viewport changes to re-fetch
  yield fork(watchViewport);
  yield fork(watchSetCategory);
  yield fork(watchRefresh);
  yield fork(watchHighlightedIssue);
  yield fork(watchToggleHelp);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

export function* watchSetCategory() {
  yield takeEvery('SET_CATEGORY', fetchCodeOwnershipData);
}

function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', function (a) {
    window.open(a.payload.webUrl);
  });
}

function* watchViewport() {
  yield takeEvery('COR_SET_VIEWPORT', mapSaga(requestRefresh));
}

function* watchToggleHelp() {
  yield takeEvery('TOGGLE_HELP', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchCodeOwnershipData);
}

function* watchHighlightedIssue() {
  yield takeEvery('SET_HIGHLIGHTED_ISSUE', function* (a) {
    return yield fetchRelatedCommits(a.payload);
  });
}

export const fetchCodeOwnershipData = fetchFactory(
  function* () {
    const state = yield select();

    const config = state.visualizations.codeOwnershipTransfer.state.config.category;
    console.log('Config', config.numOfCommits);

    return yield Promise.join(
      getDevelopers()
    )

  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);


