'use strict';

import Promise from 'bluebird';
import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';
import moment from 'moment';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import { getChartColors } from '../../../utils';
import fetchRelatedCommits from './fetchRelatedCommits.js';

export const setOverlay = createAction('SET_OVERLAY');
export const setHighlightedIssue = createAction('SET_HIGHLIGHTED_ISSUE');
export const setCommitAttribute = createAction('SET_COMMIT_ATTRIBUTE');
export const setActiveFolder = createAction('SET_HIGHLIGHTED_FOLDER');
export const setFilteredFiles = createAction('SET_FILTERED_FILES', fs => fs);
export const openCommit = createAction('OPEN_COMMIT');

export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');
export const setViewport = createAction('COR_SET_VIEWPORT');

export default function*() {
  // fetch data once on entry
  yield* fetchCodeOwnershipData();
}

export function* watchOpenCommit() {
  yield takeEvery('OPEN_COMMIT', function(a) {
    window.open(a.payload.webUrl);
  });
}

export const fetchCodeOwnershipData = fetchFactory(
  function*() {
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);