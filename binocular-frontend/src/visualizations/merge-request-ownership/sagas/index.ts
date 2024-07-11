'use strict';

import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Database from '../../../database/database';
import { createAction } from 'redux-actions';

export const setActiveVisualizations = createAction('SET_ACTIVE_VISUALIZATIONS');
export const requestMergeRequestOwnershipData = createAction('REQUEST_MERGE_REQUEST_OWNERSHIP_DATA');
export const receiveMergeRequestOwnershipData = timestampedActionFactory('RECEIVE_MERGE_REQUEST_OWNERSHIP_DATA');
export const receiveMergeRequestOwnershipDataError = createAction('RECEIVE_MERGE_REQUEST_OWNERSHIP_DATA_ERROR');
export const setCategory = createAction('SET_CATEGORY');

export default function* () {
  yield* fetchMergeRequestOwnershipData();
}

export const fetchMergeRequestOwnershipData = fetchFactory(
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
  requestMergeRequestOwnershipData,
  receiveMergeRequestOwnershipData,
  receiveMergeRequestOwnershipDataError,
);
