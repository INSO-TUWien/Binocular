import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.ts';
import { getCommitDataForSha, getOwnershipForCommits, getFilenamesForBranch, getPreviousFilenames } from './helper';
import { extractFileOwnership } from '../../../utils/ownership.js';

//define actions
export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');
export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export const setCurrentBranch = createAction('CO_SET_CURRENT_BRANCH', (b) => b);
export const setActiveFiles = createAction('CO_SET_ACTIVE_FILES', (f) => f);
export const setMode = createAction('CO_SET_MODE', (m) => m);

export default function* () {
  yield fetchCodeOwnershipData();
  yield fork(watchRefreshRequests);
  yield fork(watchRefresh);
  yield fork(watchSetCurrentBranch);
}

//throttle ensures that only one refresh action will be dispatched in an interval of 2000ms
function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}

//everytime the refresh action is dispatched (by watchRefreshRequests()), the fetchCodeOwnershipData function is called
function* watchRefresh() {
  yield takeEvery('REFRESH', fetchCodeOwnershipData);
}

function* watchSetCurrentBranch() {
  yield takeEvery('CO_SET_CURRENT_BRANCH', mapSaga(requestRefresh));
}

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeOwnershipData etc.) at appropriate points
export const fetchCodeOwnershipData = fetchFactory(
  function* () {
    const state = yield select();
    const currentBranch = state.visualizations.codeOwnership.state.config.currentBranch;

    const result = { rawData: [], previousFilenames: {} };

    if (currentBranch === null || currentBranch === undefined) {
      return result;
    }

    // get data for latest commit on the selected branch
    return yield getCommitDataForSha(currentBranch.latestCommit)
      .then(async (latestBranchCommit) => {
        if (!latestBranchCommit) {
          throw new Error('Latest branch commit not found');
        }

        const activeFiles = await getFilenamesForBranch(currentBranch.branch);

        //get previous filenames for all active files
        const previousFilenames = await getPreviousFilenames(activeFiles, currentBranch);
        //get actual ownership data for all commits on the selected branch
        let relevantOwnershipData = await getOwnershipForCommits(latestBranchCommit);
        if (relevantOwnershipData.length === 0) {
          throw new Error('No ownership data found for the current branch');
        }

        //sort by date
        relevantOwnershipData = relevantOwnershipData.sort((a, b) => new Date(a.date) - new Date(b.date));

        result.rawData = relevantOwnershipData;
        result.previousFilenames = previousFilenames;
        result.ownershipForFiles = extractFileOwnership(relevantOwnershipData);
        return result;
      })
      .catch((e) => {
        console.log('Error in code ownership saga: ', e);
        return {};
      });
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError,
);
