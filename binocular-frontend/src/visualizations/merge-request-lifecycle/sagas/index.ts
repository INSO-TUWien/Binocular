'use strict';

import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Database from '../../../database/database';

export const setActiveVisualizations = createAction('SET_ACTIVE_VISUALIZATIONS');
export const setGrouping = createAction('SET_GROUPING');
export const setGranularity = createAction('SET_GRANULARITY');
export const refresh = createAction('REFRESH');
export const requestMergeRequestLifeCycleData = createAction('REQUEST_MERGE_REQUEST_LIFECYCLE_DATA');
export const receiveMergeRequestLifeCycleData = timestampedActionFactory('RECEIVE_MERGE_REQUEST_LIFECYCLE_DATA');
export const receiveMergeRequestLifeCycleDataError = createAction('RECEIVE_MERGE_REQUEST_LIFECYCLE_DATA_ERROR');

export default function* () {
  yield* fetchMergeRequestLifeCycleData();
}

export const fetchMergeRequestLifeCycleData = fetchFactory(
  function* () {
    const { firstMergeRequest } = yield Database.getBounds();

    const firstMergeRequestTimestamp = Date.parse(firstMergeRequest.date);
    const lastMergeRequestTimestamp = Date.parse(firstMergeRequest.date);

    return yield Promise.resolve(
      Database.getMergeRequestData(
        [firstMergeRequestTimestamp, lastMergeRequestTimestamp],
        [firstMergeRequestTimestamp, lastMergeRequestTimestamp],
      ),
    ).then((result) => {
      const mergeRequests = result;
      return {
        mergeRequests,
      };
    });
  },
  requestMergeRequestLifeCycleData,
  receiveMergeRequestLifeCycleData,
  receiveMergeRequestLifeCycleDataError,
);
