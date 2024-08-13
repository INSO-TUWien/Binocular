'use strict';

import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Database from '../../../database/database';
import { put } from 'redux-saga/effects';

export const setActiveVisualizations = createAction('SET_ACTIVE_VISUALIZATIONS');
export const refresh = createAction('REFRESH');
export const requestCodeReviewMetricsData = createAction('REQUEST_CODE_REVIEW_METRICS_DATA');
export const setGrouping = createAction('SET_GROUPING');
export const setCategory = createAction('SET_CATEGORY');
export const setActiveFiles = createAction('CRM_SET_ACTIVE_FILES');
export const receiveCodeReviewMetricsData = timestampedActionFactory('RECEIVE_CODE_REVIEW_METRICS_DATA');
export const receiveCodeReviewMetricsDataError = createAction('RECEIVE_CODE_REVIEW_METRICS_DATA_ERROR');

export default function* () {
  yield* fetchCodeReviewMetricsData();
}

export interface File {
  key: string;
  webUrl: string;
}

export const fetchCodeReviewMetricsData = fetchFactory(
  function* () {
    const { firstMergeRequest, lastMergeRequest } = yield Database.getBounds();

    const firstMergeRequestTimestamp = Date.parse(firstMergeRequest.date);
    const lastMergeRequestTimestamp = Date.parse(lastMergeRequest.date);

    const results = yield Promise.all([
      new Promise((resolve) => {
        const results = Database.getMergeRequestData(
          [firstMergeRequestTimestamp, lastMergeRequestTimestamp],
          [firstMergeRequestTimestamp, lastMergeRequestTimestamp],
        );
        resolve(results);
      }),
      new Promise((resolve) => {
        const files: File[] = [];
        Database.requestFileStructure().then((result) => {
          const fs = result.files.data;
          for (const f in fs) {
            files.push({ key: fs[f].path, webUrl: fs[f].webUrl });
          }
          resolve(files);
        });
      }),
    ]);

    const mergeRequests = results[0];
    let fileList = results[1];

    fileList = fileList.map((file) => file.key);
    console.log(fileList);
    return {
      mergeRequests,
      fileList,
    };
  },
  requestCodeReviewMetricsData,
  receiveCodeReviewMetricsData,
  receiveCodeReviewMetricsDataError,
);
