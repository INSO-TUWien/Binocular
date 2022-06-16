import { createAction } from "redux-actions";
import { select, throttle, fork, takeEvery } from "redux-saga/effects";
import _ from "lodash";
import Promise from "bluebird";
import { useSelector } from 'react-redux'

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
export const setMode = createAction("SET_MODE", m => m)



export default function* () {
  yield fetchCodeExpertiseData()
  yield fork(watchRefreshRequests)
  yield fork(watchRefresh)
  yield fork(watchSetCurrentBranch)
  yield fork(watchSetActiveIssue)

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

//every time the user chooses an issue in the config tab, update the displayed data
function* watchSetActiveIssue() {
  yield takeEvery('SET_ACTIVE_ISSUE', fetchCodeExpertiseData);
}

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeExpertiseData etc.) at appropriate points
export const fetchCodeExpertiseData = fetchFactory(
  function* () {

    const state = yield select();
    const issueId = state.visualizations.codeExpertise.state.config.activeIssueId
    const branch = state.visualizations.codeExpertise.state.config.currentBranch

    console.log('Issue ID:', issueId)

    let result = {
      'devData': {},
      'issue': null
    }

    return yield Promise.join(
      getAllCommits(branch),
      getIssueData(issueId),
      getCommitsForIssue(issueId)
    ).spread((allCommits, issue, issueCommits) => {

      //########### current issue ###########
      result['issue'] = issue

      
      //########### get all relevant commits ###########
      //get most recent commit for current branch
      const mostRecentCommitOnBranch = allCommits
        .map(commit => Object.assign({}, commit, {branch: commit.branch.replace(/(?:\r\n|\r|\n)/g, '')})) //remove newlines
        .filter(commit => commit.branch.endsWith(branch)) //get commits that are assigned to branch
        .sort((a,b) => (new Date(b.date) - new Date(a.date)))[0] //get the most recent
      
      //contains all commits of the current branch
      const branchCommits = getCommitsForBranch(mostRecentCommitOnBranch, allCommits)

      //we now have all commits for the current branch and all commits for the issue
      //intersect the two groups to get the result set
      const relevantCommits = issueCommits.filter(c => branchCommits.map(c => c.sha).includes(c.sha));

      console.log("relevant Commits:" + relevantCommits.length)


      //########### extract data for each stakeholder ###########
      const commitsByStakeholders = _.groupBy(relevantCommits, (commit) => commit.signature)

      for (let stakeholder in commitsByStakeholders) {

        result['devData'][stakeholder] = {}
        result['devData'][stakeholder]['additions'] = _.reduce(commitsByStakeholders[stakeholder], (sum, commit) => {
          return sum + commit.stats.additions
        }, 0)
      }
      
      console.log("result", result)

      return result
    })
  },
  requestCodeExpertiseData,
  receiveCodeExpertiseData,
  receiveCodeExpertiseDataError
);
