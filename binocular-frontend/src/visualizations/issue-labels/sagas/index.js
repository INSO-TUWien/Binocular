'use strict';

import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery, call } from 'redux-saga/effects';
import { fetchIssueLabelsDataHelper } from './helper';
import { getConfig } from '../reducers/config';
import { timestampedActionFactory, fetchFactory, mapSaga } from '../../../sagas/utils.ts';

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export const setCurrentBranch = createAction('SET_CURRENT_BRANCH', (b) => b);
export const setSelectedLabels = createAction('SET_SELECTED_LABELS', (l) => l);
export const requestIssueLabelData = createAction('REQUEST_ISSUE_LABEL_DATA');
export const receiveIssueLabelData = timestampedActionFactory('RECEIVE_ISSUE_LABEL_DATA');

export default function* () {
  yield fetchIssueLabelsData();
  yield fork(watchRefreshRequests);
  yield fork(watchRefresh);

  yield fork(watchSetCurrentBranch);
  yield fork(watchTimeSpan);
  yield fork(watchSelectedLabels);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

function* watchRefresh() {
  yield takeEvery('REFRESH', fetchIssueLabelsData);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', mapSaga(requestRefresh));
}

function* watchSetCurrentBranch() {
  yield takeEvery('SET_CURRENT_BRANCH', mapSaga(requestRefresh));
}

function* watchSelectedLabels() {
  yield takeEvery('SET_SELECTED_LABELS', mapSaga(requestRefresh));
}

export const fetchIssueLabelsData = fetchFactory(
  function* () {
    // Get date range from universal settings
    const state = yield select();
    const universalSettings = state.universalSettings;
    const dateRange = [universalSettings.chartTimeSpan.from, universalSettings.chartTimeSpan.to];

    // Get selected labels and branch from visualization config
    const config = yield select(getConfig);
    const { selectedLabels, currentBranch } = config;

    if (!selectedLabels || selectedLabels.length === 0) {
      return {};
    }

    return yield fetchIssueLabelsDataHelper(dateRange, selectedLabels, currentBranch);
  },
  requestIssueLabelData,
  receiveIssueLabelData,
);
