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

    return yield Promise.join(
      getAllCommits(branch),
      getIssueData(issueId),
      getCommitsForIssue(issueId)
    ).spread((allCommits, issue, issueCommits) => {

      console.log('all commits', allCommits)


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

      //we now have all commits for the current branch and all commits for the issue/file
      //intersect the two groups to get the result set
      let relevantCommits

      if(mode == 'issues') {
        //if we are in issues mode, we are interested in commits that are both on the current branch and related to the issue
        relevantCommits = issueCommits.filter(c => branchCommits.map(c => c.sha).includes(c.sha));
      } else if (mode == 'modules') {
        //if we are in modules mode, we are interested in commits that are both on the current branch and related to the current file/module
        relevantCommits = branchCommits.filter(c => {
          //extract all filepaths of the commit
          const filePathsTouchedByCommit = c.files.data.map(fileObject => fileObject.file.path)
          //if the resulting array includes the active file, this commit is relevant
          return filePathsTouchedByCommit.includes(activeFile)
        })
      } else {
        console.log('error in fetchCodeExpertiseData: invalid mode: ' + mode)
        //TODO handle error
      }
      

      //console.log("relevant Commits:" + relevantCommits.length + ": ", relevantCommits)


      //########### extract data for each stakeholder ###########
      
      //first group all relevant commits by stakeholder
      const commitsByStakeholders = _.groupBy(relevantCommits, (commit) => commit.signature)

      for (let stakeholder in commitsByStakeholders) {

        result['devData'][stakeholder] = {}

        //for each stakeholder, sum up relevant additions
        result['devData'][stakeholder]['additions'] = _.reduce(commitsByStakeholders[stakeholder], (sum, commit) => {
          
          if(mode == 'issues') {
            //if mode is issues, we are interested in all additions made in each commit
            return sum + commit.stats.additions

          } else if (mode == 'modules') {
            //if mode is modules, we are only interested in the additions made to the currently active file
            const relevantFile = commit.files.data.filter(f => f.file.path == activeFile)
            //if this file exists, return the respective additions
            if(relevantFile !== null && relevantFile !== undefined && relevantFile.length > 0) {
              return relevantFile[0].stats.additions

            } else {
              console.log('error in fetchCodeExpertiseData: relevantFile does not exist')
              return 0
            }
          } else {
            console.log('error in fetchCodeExpertiseData: invalid mode: ' + mode)
            return 0
          }
          
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
