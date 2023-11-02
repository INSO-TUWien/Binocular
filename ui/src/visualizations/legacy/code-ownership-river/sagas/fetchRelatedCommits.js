'use strict';

import { createAction } from 'redux-actions';
import Database from '../../../../database/database';
import { fetchFactory, timestampedActionFactory } from '../../../../sagas/utils.js';

export const requestRelatedCommits = createAction('COR_REQUEST_RELATED_COMMITS');
export const receiveRelatedCommits = timestampedActionFactory('COR_RECEIVE_RELATED_COMMITS');
export const receiveRelatedCommitsError = createAction('COR_RECEIVE_RELATED_COMMITS_ERROR');

export default fetchFactory(
  function* (issue) {
    return yield Database.getRelatedCommitDataOwnershipRiver(issue);
  },
  requestRelatedCommits,
  receiveRelatedCommits,
  receiveRelatedCommitsError
);
