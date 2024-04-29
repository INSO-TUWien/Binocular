import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.ts';

import { modulesModeData, issuesModeData, commitsToOwnership, getCommitsForBranch } from './helper';
import { extractFileOwnership } from '../../../utils/ownership.js';

//define actions
export const requestCodeExpertiseData = createAction('REQUEST_CODE_EXPERTISE_DATA');
export const receiveCodeExpertiseData = timestampedActionFactory('RECEIVE_CODE_EXPERTISE_DATA');
export const receiveCodeExpertiseDataError = createAction('RECEIVE_CODE_EXPERTISE_DATA_ERROR');
export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export const setCurrentBranch = createAction('SET_CURRENT_BRANCH', (b) => b);
export const setActiveIssue = createAction('SET_ACTIVE_ISSUE', (i) => i);
export const setActiveFiles = createAction('SET_ACTIVE_FILES', (f) => f);
export const setMode = createAction('SET_MODE', (m) => m);
export const setDetails = createAction('SET_DETAILS', (d) => d);
export const setOnlyDisplayOwnership = createAction('SET_ONLY_DISPLAY_OWNERSHIP', (o) => o);

export default function* () {
  yield fetchCodeExpertiseData();
  yield fork(watchRefreshRequests);
  yield fork(watchRefresh);
  yield fork(watchSetCurrentBranch);
  yield fork(watchSetMode);
  yield fork(watchSetActiveIssue);

  //yield fork(...); for every additional watcher function
}

//mapSaga is a helper function from binocular-frontend > src > sagas > utils.ts that just returns
// a function that calls the action creator (in this case refresh)
//throttle ensures that only one refresh action will be dispatched in an interval of 2000ms
function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

//everytime the refresh action is dispatched (by watchRefreshRequests()), the fetchCodeExpertiseData function is called
function* watchRefresh() {
  yield takeEvery('REFRESH', fetchCodeExpertiseData);
}

function* watchSetCurrentBranch() {
  yield takeEvery('SET_CURRENT_BRANCH', mapSaga(requestRefresh));
}

function* watchSetMode() {
  yield takeEvery('SET_MODE', mapSaga(requestRefresh));
}

//every time the user chooses an issue in the config tab, update the displayed data
function* watchSetActiveIssue() {
  yield takeEvery('SET_ACTIVE_ISSUE', mapSaga(requestRefresh));
}

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeExpertiseData etc.) at appropriate points
export const fetchCodeExpertiseData = fetchFactory(
  function* () {
    const state = yield select();
    const mode = state.visualizations.codeExpertise.state.config.mode;
    const issueId = state.visualizations.codeExpertise.state.config.activeIssueId;
    const activeFiles = state.visualizations.codeExpertise.state.config.activeFiles;
    const currentBranch = state.visualizations.codeExpertise.state.config.currentBranch;

    const result = {
      branchCommits: null,
      builds: null,
      prevFilenames: null,
      issue: null,
      ownershipForFiles: null,
    };

    if (currentBranch === null || currentBranch === undefined) return result;

    if (mode === 'issues') {
      if (issueId === null) return result;

      return yield issuesModeData(currentBranch, issueId).then(
        ([allCommits, issueData, relevantCommitHashes, buildData, prevFilenames]) => {
          const branchCommits = getCommitsForBranch(currentBranch, allCommits);

          return {
            branchCommits: branchCommits,
            builds: buildData,
            prevFilenames: prevFilenames,
            issue: {
              issueData: issueData,
              issueCommits: relevantCommitHashes,
            },
            ownershipForFiles: extractFileOwnership(commitsToOwnership(allCommits)),
          };
        },
      );
    } else if (mode === 'modules') {
      if (activeFiles === null || activeFiles.length === 0) return result;
      return yield modulesModeData(currentBranch).then(([allCommits, builds, prevFilenames]) => {
        const branchCommits = getCommitsForBranch(currentBranch, allCommits);

        return {
          branchCommits: branchCommits,
          builds: builds,
          prevFilenames: prevFilenames,
          issue: null,
          ownershipForFiles: extractFileOwnership(commitsToOwnership(allCommits)),
        };
      });
    } else {
      console.log('error in fetchCodeExpertiseData: invalid mode: ' + mode);
      return result;
    }
  },
  requestCodeExpertiseData,
  receiveCodeExpertiseData,
  receiveCodeExpertiseDataError,
);
