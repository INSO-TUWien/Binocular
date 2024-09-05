'use strict';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Database from '../../../database/database';
import { createAction } from 'redux-actions';
import { fork, select, takeEvery } from 'redux-saga/effects';

export const setActiveVisualizations = createAction('SET_ACTIVE_VISUALIZATIONS');
export const requestMergeRequestOwnershipData = createAction('REQUEST_MERGE_REQUEST_OWNERSHIP_DATA');
export const receiveMergeRequestOwnershipData = timestampedActionFactory('RECEIVE_MERGE_REQUEST_OWNERSHIP_DATA');
export const receiveMergeRequestOwnershipDataError = createAction('RECEIVE_MERGE_REQUEST_OWNERSHIP_DATA_ERROR');
export const setCategory = createAction('SET_CATEGORY');
export const onlyShowAuthors = createAction('SET_ONLY_SHOW_AUTHORS');

export default function* () {
  yield* fetchMergeRequestOwnershipData();
  yield fork(watchTimeSpan);
}

function* watchTimeSpan() {
  yield takeEvery('SET_TIME_SPAN', fetchMergeRequestOwnershipData);
}

export const fetchMergeRequestOwnershipData = fetchFactory(
  function* () {
    const { firstMergeRequest } = yield Database.getBounds();

    const firstMergeRequestTimestamp = Date.parse(firstMergeRequest.date);
    const lastMergeRequestTimestamp = Date.parse(firstMergeRequest.date);

    let firstSignificantTimestamp = firstMergeRequestTimestamp;
    let lastSignificantTimestamp = lastMergeRequestTimestamp;

    const state = yield select();

    const timeSpan = state.universalSettings.chartTimeSpan;
    firstSignificantTimestamp = timeSpan.from === undefined ? firstSignificantTimestamp : new Date(timeSpan.from).getTime();
    lastSignificantTimestamp = timeSpan.to === undefined ? lastSignificantTimestamp : new Date(timeSpan.to).getTime();

    console.log(firstSignificantTimestamp);

    return yield Promise.resolve(
      Database.getMergeRequestData(
        [firstMergeRequestTimestamp, lastMergeRequestTimestamp],
        [firstSignificantTimestamp, lastSignificantTimestamp],
      ),
    ).then((result) => {
      const mergeRequests = result;
      return {
        mergeRequests,
      };
    });
  },
  requestMergeRequestOwnershipData,
  receiveMergeRequestOwnershipData,
  receiveMergeRequestOwnershipDataError,
);
