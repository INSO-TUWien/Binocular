'use strict';

import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Promise from 'bluebird';
import getCommitData from './get-commit-data';
import getBranchData from './get-branch-data';
import { endpointUrl } from '../../../utils';
import { fork, takeEvery } from 'redux-saga/effects';
import getParentAndForks from './get-parent-and-forks';
import indexProject from './index-project';

// sets a new color for a specific project (key - baseProject/otherProject/combined)
export const setColor = createAction('SET_COLOR', (color, key) => {
  return { color, key };
});

// sets a selected other project (parent or fork of the base project)
export const setOtherProject = createAction('SET_OTHER_PROJECT', (otherProject) => otherProject);

// gets the branches and commits of specific projects, gets the parent/forks of the base project (if requested) and
// triggers the indexing of a specific project (if requested)
export const requestConflictAwarenessData = createAction('REQUEST_CONFLICT_AWARENESS_DATA');
export const receiveConflictAwarenessData = timestampedActionFactory(
  'RECEIVE_CONFLICT_AWARENESS_DATA'
);
export const updateConflictAwarenessData = createAction(
  'UPDATE_CONFLICT_AWARENESS_DATA',
  (projects, shouldGetParentAndForks, ownerAndProjectToIndex) => {
    return { projects, shouldGetParentAndForks, ownerAndProjectToIndex };
  }
);

// get requested diffs of a specific commit sha
export const requestDiff = createAction('REQUEST_DIFF');
export const receiveDiff = timestampedActionFactory('RECEIVE_DIFF');
export const getDiff = createAction('GET_DIFF');

// inits all watchers
export default function* () {
  yield fork(watchDiff);
  yield fork(watchUpdateConflictAwarenessData);
}

/**
 * Fetches
 * the commits and branches of specific projects,
 * the parent and forks of the base project (if requested) and
 * triggers the indexing of a project (if requested).
 */
export const fetchConflictAwarenessData = fetchFactory(
  function* (projects = [], shouldGetParentAndForks = true, ownerAndProjectToIndex = []) {
    // triggers the indexing of a project if one the owner and the repository was provided
    let indexingPromise = Promise.resolve(); // only needed to start the Promise chain if no project should be indexed
    if (ownerAndProjectToIndex.length > 0) {
      indexingPromise = indexProject(ownerAndProjectToIndex[0], ownerAndProjectToIndex[1]);
    }

    return yield indexingPromise
      .then(() => {
        // get the parent and the forks of the base project if requested
        let parentAndForksPromise = Promise.resolve(); // only needed to have shorter code for the decision if the data should be requested or not
        if (shouldGetParentAndForks) {
          parentAndForksPromise = getParentAndForks();
        }
        return Promise.join(
          getCommitData(projects),
          getBranchData(projects),
          parentAndForksPromise
        );
      })
      .then(([commits, branches, parentAndForks]) => {
        // return the retrieved data for the state
        let data = {
          commits,
          branches,
        };
        if (parentAndForks) {
          data.parent = parentAndForks.parent;
          data.forks = parentAndForks.forks;
        }
        return data;
      })
      .catch((e) => {
        console.error(e.stack);
        throw e;
      });
  },
  requestConflictAwarenessData,
  receiveConflictAwarenessData
);

/**
 * Fetches the diff of a specific commit sha.
 */
export const fetchDiff = fetchFactory(
  function (commitSha) {
    return fetch(endpointUrl('diff'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sha: commitSha }),
    }).then((resp) => resp.json());
  },
  requestDiff,
  receiveDiff
);

/**
 * Watches all getDiff actions and fetches the diff of a specific commit sha.
 */
export function* watchDiff() {
  yield takeEvery('GET_DIFF', function* (a) {
    yield* fetchDiff(a.payload);
  });
}

/**
 * Watches all updateConflictAwarenessData actions and fetches
 * the commits and branches of specific projects,
 * the parent and forks of the base project (if requested) and
 * triggers the indexing of a project (if requested).
 */
export function* watchUpdateConflictAwarenessData() {
  yield takeEvery('UPDATE_CONFLICT_AWARENESS_DATA', function* (a) {
    yield* fetchConflictAwarenessData(
      a.payload.projects,
      a.payload.shouldGetParentAndForks,
      a.payload.ownerAndProjectToIndex
    );
  });
}
