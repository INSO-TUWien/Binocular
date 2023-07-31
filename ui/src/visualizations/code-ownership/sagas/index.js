import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';
import { getBranches, getCommitDataForSha, getOwnershipForCommits } from './helper.js';

//define actions
export const requestCodeOwnershipData = createAction('REQUEST_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipData = timestampedActionFactory('RECEIVE_CODE_OWNERSHIP_DATA');
export const receiveCodeOwnershipDataError = createAction('RECEIVE_CODE_OWNERSHIP_DATA_ERROR');
export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export const setCurrentBranch = createAction('CO_SET_CURRENT_BRANCH', (b) => b);

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
    const currentBranchName = 'develop'
    //TODO: use config and state for this in the future
    //const currentBranchName = state.visualizations.codeOwnership.state.config.currentBranch;

    const result = {ownershipData: []};

    return yield getBranches().then(async (branches) => {
      const currentBranch = branches.filter((b) => b.branch === currentBranchName)[0];
      
      //if branch does not exist
      if (!currentBranch) {
        throw new Error('Branch does not exist');
      }

      // get data for latest commit on the selected branch
      const latestBranchCommit = await getCommitDataForSha(currentBranch.latestCommit);
      if(!latestBranchCommit) {
        throw new Error('Latest branch commit not found');
      }

      let relevantOwnershipData = await getOwnershipForCommits(latestBranchCommit.history);
      if(relevantOwnershipData.length === 0) {
        throw new Error('No ownership data found for the current branch');
      }

      //sort by date
      relevantOwnershipData = relevantOwnershipData.sort((a,b) => new Date(a.date) - new Date(b.date))

      //stores the current ownership distribution for each file
      const fileCache = {}

      //step through the commits sequentially, starting with the oldest one
      for (const commit of relevantOwnershipData) {
        const commitResult = {sha: commit.sha, date : commit.date, ownership: {}};

        //update fileCache
        for(const file of commit.files) {
          if (file.action === 'deleted') {
            delete fileCache[file.path];
          } else {
            fileCache[file.path] = file.ownership;
          }
        }

        //now filecache stores the current ownership for each file that exists at the time of the current commit
        //TODO: this would be the time to filter which files we are interested in. For example: users could select only the ui directory
        for (const [filePath, fileOwnershipData] of Object.entries(fileCache)) {
          for(const ownershipOfStakeholder of fileOwnershipData) {
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

    }).catch((e) => {
      console.log('Error in code ownership saga: ', e);
      return {}
    })

    
  },
  requestCodeOwnershipData,
  receiveCodeOwnershipData,
  receiveCodeOwnershipDataError
);
