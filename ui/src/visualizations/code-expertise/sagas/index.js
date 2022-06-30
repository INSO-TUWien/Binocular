import { createAction } from "redux-actions";
import { select, throttle, fork, takeEvery } from "redux-saga/effects";
import _ from "lodash";
import Promise from "bluebird";

import {
  fetchFactory,
  timestampedActionFactory,
  mapSaga,
} from "../../../sagas/utils.js";

import { getAllCommits, getCommitsForBranch, getCommitsForIssue, getIssueData } from "./helper.js"





//define actions
export const requestCodeExpertiseData = createAction("REQUEST_CODE_EXPERTISE_DATA")
export const receiveCodeExpertiseData = timestampedActionFactory("RECEIVE_CODE_EXPERTISE_DATA")
export const receiveCodeExpertiseDataError = createAction("RECEIVE_CODE_EXPERTISE_DATA_ERROR")
export const requestRefresh = createAction("REQUEST_REFRESH")
const refresh = createAction("REFRESH")

export const setCurrentBranch = createAction("SET_CURRENT_BRANCH", b => b)
export const setActiveIssue = createAction("SET_ACTIVE_ISSUE", i => i)
export const setActiveFile = createAction("SET_ACTIVE_FILE", f => f)
export const setMode = createAction("SET_MODE", m => m)



export default function* () {
  yield fetchCodeExpertiseData()
  yield fork(watchRefreshRequests)
  yield fork(watchRefresh)
  yield fork(watchSetCurrentBranch)
  yield fork(watchSetMode)
  yield fork(watchSetActiveIssue)
  yield fork(watchSetActiveFile)

  //yield fork(...); for every additional watcher function
}

//mapSaga is a helper function from ui > src > sagas > utils.js that just returns a function that calls the action creator (in this case refresh)
//throttle ensures that only one refresh action will be dispatched in an interval of 2000ms
function* watchRefreshRequests() {
  yield throttle(2000, "REQUEST_REFRESH", mapSaga(refresh));
}

//everytime the refresh action is dispatched (by watchRefreshRequests()), the fetchCodeExpertiseData function is called
function* watchRefresh() {
  yield takeEvery("REFRESH", fetchCodeExpertiseData);
}


function* watchSetCurrentBranch() {
  yield takeEvery('SET_CURRENT_BRANCH', fetchCodeExpertiseData);
}

function* watchSetMode() {
  yield takeEvery('SET_MODE', fetchCodeExpertiseData);
}

function* watchSetActiveFile() {
  yield takeEvery('SET_ACTIVE_FILE', fetchCodeExpertiseData);
}

//every time the user chooses an issue in the config tab, update the displayed data
function* watchSetActiveIssue() {
  yield takeEvery('SET_ACTIVE_ISSUE', fetchCodeExpertiseData);
}

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeExpertiseData etc.) at appropriate points
export const fetchCodeExpertiseData = fetchFactory(
  function* () {

    const state = yield select();
    const mode = state.visualizations.codeExpertise.state.config.mode
    const issueId = state.visualizations.codeExpertise.state.config.activeIssueId
    const activeFile = state.visualizations.codeExpertise.state.config.activeFile
    const branch = state.visualizations.codeExpertise.state.config.currentBranch

    let result = {
      'devData': {},
      'issue': null
    }

    if(branch == null) return result

    if(mode == 'issues') {

      if(issueId == null) return result

      return yield Promise.join(
        getAllCommits(),
        getIssueData(issueId),
        getCommitsForIssue(issueId)
      ).spread((allCommits, issue, issueCommits) => {
  
        console.log('all commits', allCommits)

        //########### current issue ###########
        result['issue'] = issue
  
        //########### get all relevant commits ###########
        
        //contains all commits of the current branch
        const branchCommits = getCommitsForBranch(branch, allCommits)
  
        //we now have all commits for the current branch and all commits for the issue
        //intersect the two groups to get the result set
        //we are interested in commits that are both on the current branch and related to the issue
        let relevantCommits = branchCommits.filter(commit => issueCommits.map(c => c.sha).includes(commit.sha));

        if(relevantCommits.length == 0) {
          return result
        }
  
        //########### extract data for each stakeholder ###########
        
        //first group all relevant commits by stakeholder
        const commitsByStakeholders = _.groupBy(relevantCommits, (commit) => commit.signature)
  
        for (let stakeholder in commitsByStakeholders) {
  
          result['devData'][stakeholder] = {}

  
          //for each stakeholder, sum up relevant additions
          result['devData'][stakeholder]['additions'] = _.reduce(commitsByStakeholders[stakeholder], (sum, commit) => {
            //we are interested in all additions made in each commit
            return sum + commit.stats.additions
          }, 0)
        }
        
        console.log("result", result)
  
        return result
      })



    } else if(mode == 'modules') {

      if(activeFile == null) return result

      return yield Promise.join(
        getAllCommits(),
      ).spread((allCommits) => {
  
        console.log('all commits', allCommits)

        //########### get all relevant commits ###########
        
        //contains all commits of the current branch
        const branchCommits = getCommitsForBranch(branch, allCommits)
  
        //we now have all commits for the current branch and all commits for the file
        //intersect the two groups to get the result set
  
        //we are interested in commits that are both on the current branch and related to the current file/module
        let relevantCommits = branchCommits.filter(c => {
          //extract all filepaths of the commit
          const filePathsTouchedByCommit = c.files.data.map(fileObject => fileObject.file.path)
          //if the resulting array includes the active file, this commit is relevant
          return filePathsTouchedByCommit.includes(activeFile)
        })

        if(relevantCommits.length == 0) {
          return result
        }

        //########### extract data for each stakeholder ###########
        
        //first group all relevant commits by stakeholder
        const commitsByStakeholders = _.groupBy(relevantCommits, (commit) => commit.signature)
  
        for (let stakeholder in commitsByStakeholders) {
  
          result['devData'][stakeholder] = {}
  
          //for each stakeholder, sum up relevant additions
          result['devData'][stakeholder]['additions'] = _.reduce(commitsByStakeholders[stakeholder], (sum, commit) => {
            
            //we are only interested in the additions made to the currently active file
            const relevantFile = commit.files.data.filter(f => f.file.path == activeFile)
            //if this file exists, return the respective additions
            if(relevantFile !== null && relevantFile !== undefined && relevantFile.length > 0) {
              return relevantFile[0].stats.additions

            } else {
              console.log('error in fetchCodeExpertiseData: relevantFile does not exist')
              return 0
            }
            
          }, 0)
        }
        
        console.log("result", result)
  
        return result
      })



    } else {
      console.log('error in fetchCodeExpertiseData: invalid mode: ' + mode)
      return result
      //TODO handle error
    }
  },
  requestCodeExpertiseData,
  receiveCodeExpertiseData,
  receiveCodeExpertiseDataError
);
