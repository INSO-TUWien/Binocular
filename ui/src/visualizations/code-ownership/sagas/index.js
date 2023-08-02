import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import { getCommitDataForSha, getOwnershipForCommits, getPreviousFilenames } from './helper.js';

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
  yield fork(watchSetActiveFiles);
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

function* watchSetActiveFiles() {
  yield takeEvery('CO_SET_ACTIVE_FILES', mapSaga(requestRefresh));
}

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeOwnershipData etc.) at appropriate points
export const fetchCodeOwnershipData = fetchFactory(
  function* () {
    const state = yield select();
    const activeFiles = state.visualizations.codeOwnership.state.config.activeFiles;
    const currentBranch = state.visualizations.codeOwnership.state.config.currentBranch;

    const result = { ownershipData: [] };

    if (
      currentBranch === null ||
      currentBranch === undefined ||
      activeFiles === null ||
      activeFiles === undefined ||
      activeFiles.length === 0
    ) {
      return result;
    }

    // get data for latest commit on the selected branch
    return yield getCommitDataForSha(currentBranch.latestCommit)
      .then(async (latestBranchCommit) => {
        if (!latestBranchCommit) {
          throw new Error('Latest branch commit not found');
        }

        //get previous filenames for all active files
        const previousFilenames = await getPreviousFilenames(activeFiles, currentBranch);

        //get actual ownership data for all commits on the selected branch
        let relevantOwnershipData = await getOwnershipForCommits(latestBranchCommit.history);
        if (relevantOwnershipData.length === 0) {
          throw new Error('No ownership data found for the current branch');
        }

        //sort by date
        relevantOwnershipData = relevantOwnershipData.sort((a, b) => new Date(a.date) - new Date(b.date));

        //stores the current ownership distribution for each file
        const fileCache = {};

        //step through the commits sequentially, starting with the oldest one
        for (const commit of relevantOwnershipData) {
          const commitResult = { sha: commit.sha, date: commit.date, ownership: {} };

          //update fileCache for each file this commit touches
          for (const file of commit.files) {
            //if the file was deleted in this commit, delete it from the filecache
            if (file.action === 'deleted') {
              delete fileCache[file.path];
            } else {
              //if the file was either added or modified, we add it to the filecache (if it is relevant)
              //the file is relevant if it is either one of the currently active files
              // or if it is a previous version of an active file.
              let relevant = activeFiles.includes(file.path);

              if (!relevant) {
                //look at the previous filenames of all active files
                for (const [fileName, previousNames] of Object.entries(previousFilenames)) {
                  if (relevant) break;
                  //for all previous filenames of the file we are currently looking at
                  for (const name of previousNames) {
                    //if this old filename is the one the current commit touches
                    // (same path and committed at a time where the file had that path),
                    // this file is relevant
                    if (
                      name.oldFilePath === file.path &&
                      new Date(name.hasThisNameFrom) <= new Date(commit.date) &&
                      new Date(commit.date) <= new Date(name.hasThisNameUntil)
                    ) {
                      relevant = true;
                      break;
                    }
                  }
                }
              }

              if (relevant) {
                fileCache[file.path] = file.ownership;
              }
            }
          }

          //now filecache stores the current ownership for each file that exists at the time of the current commit
          for (const [filePath, fileOwnershipData] of Object.entries(fileCache)) {
            for (const ownershipOfStakeholder of fileOwnershipData) {
              if (commitResult.ownership[ownershipOfStakeholder.stakeholder]) {
                commitResult.ownership[ownershipOfStakeholder.stakeholder] += ownershipOfStakeholder.ownedLines;
              } else {
                commitResult.ownership[ownershipOfStakeholder.stakeholder] = ownershipOfStakeholder.ownedLines;
              }
            }
          }
          result.ownershipData.push(commitResult);
        }
        return result;
      })
      .catch((e) => {
        console.log('Error in code ownership saga: ', e);
        return {};
      });
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);
