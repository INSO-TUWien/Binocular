'use strict';

import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Database from '../../../database/database';

export const setActiveVisualizations = createAction('SET_ACTIVE_VISUALIZATIONS');
export const refresh = createAction('REFRESH');
export const requestCodeReviewMetricsData = createAction('REQUEST_CODE_REVIEW_METRICS_DATA');
export const receiveCodeReviewMetricsData = timestampedActionFactory('RECEIVE_CODE_REVIEW_METRICS_DATA');
export const receiveCodeReviewMetricsDataError = createAction('RECEIVE_CODE_REVIEW_METRICS_DATA_ERROR');

export default function* () {
  yield fetchCodeReviewMetricsData;
}

export const fetchCodeReviewMetricsData = fetchFactory(
  function* () {
    return yield function () {
      return Promise.resolve(Database.getMergeRequestData());
    };
  },
  requestCodeReviewMetricsData,
  receiveCodeReviewMetricsData,
  receiveCodeReviewMetricsDataError,
);
