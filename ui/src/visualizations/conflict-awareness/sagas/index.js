'use strict';

import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Promise from 'bluebird';
import getCommitData from './getCommitData';
import getBranchData from './getBranchData';

export const setColor = createAction('SET_COLOR', (color, key) => {
  return { color, key };
});

export const requestConflictAwarenessData = createAction('REQUEST_CONFLICT_AWARENESS_DATA');
export const receiveConflictAwarenessData = timestampedActionFactory(
  'RECEIVE_CONFLICT_AWARENESS_DATA'
);

export default function* () {
  // fetch data once on entry
  yield* fetchConflictAwarenessData();
}

/**
 * Fetch data for conflict awareness, this still includes old functions that were copied over.
 */
export const fetchConflictAwarenessData = fetchFactory(
  function* () {
    return yield Promise.join(getCommitData(), getBranchData())
      .spread((commits, branches) => {
        return {
          commits,
          branches,
        };
      })
      .catch((e) => {
        console.error(e.stack);
        throw e;
      });
  },
  requestConflictAwarenessData,
  receiveConflictAwarenessData
);
