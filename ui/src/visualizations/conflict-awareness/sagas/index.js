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
import getIssueData from './get-issue-data';

// updates the selected issue from the list
export const setSelectedIssue = createAction(
  'SET_SELECTED_ISSUE',
  (selectedIssue) => selectedIssue
);

// updates the issueSelector for showing a list of GitHub issues or a text field
export const setIssueSelector = createAction(
  'SET_ISSUE_SELECTOR',
  (issueSelector) => issueSelector
);

// sets a new issueID for highlighting its commits
export const setIssueForFilter = createAction('SET_ISSUE_FOR_FILTER', (issueID) => issueID);

// sets a new color for a specific project (key - baseProject/otherProject/combined)
export const setColor = createAction('SET_COLOR', (color, key) => {
  return { color, key };
});

// sets a selected other project (parent or fork of the base project)
export const setOtherProject = createAction('SET_OTHER_PROJECT', (otherProject) => otherProject);

// sets the property of the state to undefined
export const resetStateProperty = createAction(
  'RESET_STATE_PROPERTY',
  (stateProperty) => stateProperty
);

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

// get requested diff of a specific commit sha
export const requestDiff = createAction('REQUEST_DIFF');
export const receiveDiff = timestampedActionFactory('RECEIVE_DIFF');
export const getDiff = createAction('GET_DIFF');

// check if a rebase is possible without conflicts or not
export const requestRebaseCheck = createAction('REQUEST_REBASE_CHECK');
export const receiveRebaseCheck = timestampedActionFactory('RECEIVE_REBASE_CHECK');
export const getRebaseCheck = createAction(
  'GET_REBASE_CHECK',
  (headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch) => {
    return { headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch };
  }
);

// check if a merge is possible without conflicts or not
export const requestMergeCheck = createAction('REQUEST_MERGE_CHECK');
export const receiveMergeCheck = timestampedActionFactory('RECEIVE_MERGE_CHECK');
export const getMergeCheck = createAction(
  'GET_MERGE_CHECK',
  (fromRepo, fromBranch, toRepo, toBranch) => {
    return { fromRepo, fromBranch, toRepo, toBranch };
  }
);

// check if cherry picks are possible without conflicts or not
export const requestCherryPickCheck = createAction('REQUEST_CHERRY_PICK_CHECK');
export const receiveCherryPickCheck = timestampedActionFactory('RECEIVE_CHERRY_PICK_CHECK');
export const getCherryPickCheck = createAction(
  'GET_CHERRY_PICK_CHECK',
  (cherryPickCommitInfos, otherRepo, toRepo, toBranch) => {
    return { cherryPickCommitInfos, otherRepo, toRepo, toBranch };
  }
);

// inits all watchers
export default function* () {
  yield fork(watchDiff);
  yield fork(watchUpdateConflictAwarenessData);
  yield fork(watchCheckRebase);
  yield fork(watchCheckMerge);
  yield fork(watchCheckCherryPick);
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
        let issuesPromise = Promise.resolve(); // only needed to have shorter code for the decision if the data should be requested or not
        if (shouldGetParentAndForks) {
          parentAndForksPromise = getParentAndForks();
          issuesPromise = getIssueData();
        }
        return Promise.join(
          getCommitData(projects),
          getBranchData(projects),
          parentAndForksPromise,
          issuesPromise
        );
      })
      .then(([commits, branches, parentAndForks, issues]) => {
        // return the retrieved data for the state
        let data = {
          commits,
          branches,
        };
        if (parentAndForks) {
          data.parent = parentAndForks.parent;
          data.forks = parentAndForks.forks;
        }
        if (issues) {
          data.issues = issues;
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
 * Checks if a rebase is possible without conflicts or not.
 * If not, the data of the conflict will be returned.
 */
export const fetchRebaseCheck = fetchFactory(
  function (headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch) {
    return fetch(endpointUrl('check/rebase'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        headSha,
        rebaseRepo,
        rebaseBranch,
        upstreamRepo,
        upstreamBranch,
      }),
    }).then((resp) => resp.json());
  },
  requestRebaseCheck,
  receiveRebaseCheck
);

/**
 * Checks if a merge is possible without conflicts or not.
 * If not, the data of the conflict will be returned.
 */
export const fetchMergeCheck = fetchFactory(
  function (fromRepo, fromBranch, toRepo, toBranch) {
    return fetch(endpointUrl('check/merge'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromRepo,
        fromBranch,
        toRepo,
        toBranch,
      }),
    }).then((resp) => resp.json());
  },
  requestMergeCheck,
  receiveMergeCheck
);

/**
 * Checks if cherry picks are possible without conflicts or not.
 * If not, the data of the conflict will be returned.
 */
export const fetchCherryPickCheck = fetchFactory(
  function (cherryPickCommitInfos, otherRepo, toRepo, toBranch) {
    return fetch(endpointUrl('check/cherrypick'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cherryPickCommitInfos,
        otherRepo,
        toRepo,
        toBranch,
      }),
    }).then((resp) => resp.json());
  },
  requestCherryPickCheck,
  receiveCherryPickCheck
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
 * Watches all getRebase actions and checks if a rebase will be successful or causes a conflict.
 */
export function* watchCheckRebase() {
  yield takeEvery('GET_REBASE_CHECK', function* (a) {
    yield* fetchRebaseCheck(
      a.payload.headSha,
      a.payload.rebaseRepo,
      a.payload.rebaseBranch,
      a.payload.upstreamRepo,
      a.payload.upstreamBranch
    );
  });
}

/**
 * Watches all getMergeCheck actions and checks if a merge will be successful or causes a conflict.
 */
export function* watchCheckMerge() {
  yield takeEvery('GET_MERGE_CHECK', function* (a) {
    yield* fetchMergeCheck(
      a.payload.fromRepo,
      a.payload.fromBranch,
      a.payload.toRepo,
      a.payload.toBranch
    );
  });
}

/**
 * Watches all getCherryPick actions and checks if cherry picks will be successful or causes a conflict.
 */
export function* watchCheckCherryPick() {
  yield takeEvery('GET_CHERRY_PICK_CHECK', function* (a) {
    yield* fetchCherryPickCheck(
      a.payload.cherryPickCommitInfos,
      a.payload.otherRepo,
      a.payload.toRepo,
      a.payload.toBranch
    );
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
