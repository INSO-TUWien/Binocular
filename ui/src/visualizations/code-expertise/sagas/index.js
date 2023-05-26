import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';

import {
  getAllCommits,
  getCommitsForBranch,
  getCommitHashesForIssue,
  getCommitHashesForFiles,
  getIssueData,
  getAllBuildData,
  addBuildData,
  getBlameModules,
  getBlameIssues,
  getBranches,
  getFilesForCommits,
} from './helper.js';

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
export const setFilterMergeCommits = createAction('SET_FILTER_MERGE_COMMITS', (f) => f);
export const setOnlyDisplayOwnership = createAction('SET_ONLY_DISPLAY_OWNERSHIP', (o) => o);

export default function* () {
  yield fetchCodeExpertiseData();
  yield fork(watchRefreshRequests);
  yield fork(watchRefresh);
  yield fork(watchSetCurrentBranch);
  yield fork(watchSetMode);
  yield fork(watchSetActiveIssue);
  yield fork(watchSetActiveFiles);
  yield fork(watchSetFilterMergeCommits);

  //yield fork(...); for every additional watcher function
}

//mapSaga is a helper function from ui > src > sagas > utils.js that just returns
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

function* watchSetActiveFiles() {
  yield takeEvery('SET_ACTIVE_FILES', mapSaga(requestRefresh));
}

//every time the user chooses an issue in the config tab, update the displayed data
function* watchSetActiveIssue() {
  yield takeEvery('SET_ACTIVE_ISSUE', mapSaga(requestRefresh));
}

function* watchSetFilterMergeCommits() {
  yield takeEvery('SET_FILTER_MERGE_COMMITS', mapSaga(requestRefresh));
}

//fetchFactory returns a function that calls the specified function*()
// and dispatches the specified actions (requestCodeExpertiseData etc.) at appropriate points
export const fetchCodeExpertiseData = fetchFactory(
  function* () {
    const state = yield select();
    const mode = state.visualizations.codeExpertise.state.config.mode;
    const issueId = state.visualizations.codeExpertise.state.config.activeIssueId;
    const activeFiles = state.visualizations.codeExpertise.state.config.activeFiles;
    const branch = state.visualizations.codeExpertise.state.config.currentBranch;
    const filterMergeCommits = state.visualizations.codeExpertise.state.config.filterMergeCommits;
    const offlineMode = state.config.offlineMode;

    const result = {
      devData: {},
      issue: null,
    };

    if (branch === null) return result;

    //########### get data from database (depending on mode) ###########

    let dataPromise;

    if (mode === 'issues') {
      if (issueId === null) return result;

      dataPromise = Promise.all([
        getAllCommits(),
        getIssueData(issueId),
        getCommitHashesForIssue(issueId),
        getAllBuildData(),
        getBranches(),
      ]).then((results) => {
        const allCommits = results[0];
        const issue = results[1];
        const issueCommitHashes = results[2];
        const builds = results[3];
        const branches = results[4];
        //set current issue
        result['issue'] = issue;
        return [allCommits, issueCommitHashes, builds, branches];
      });
    } else if (mode === 'modules') {
      if (activeFiles === null || activeFiles.length === 0) return result;

      dataPromise = Promise.all([getAllCommits(), getCommitHashesForFiles(activeFiles), getAllBuildData(), getBranches()]);
    } else {
      console.log('error in fetchCodeExpertiseData: invalid mode: ' + mode);
      return result;
    }

    return yield dataPromise.then(([allCommits, relevantCommitsHashes, builds, branches]) => {
      //########### get all relevant commits ###########
      //get full branch object for currently selected branch
      const currentBranchObject = branches.filter((b) => b.branch === branch)[0];

      //contains all commits of the current branch
      const branchCommits = getCommitsForBranch(currentBranchObject, allCommits);

      //we now have all commits for the current branch and all commits for the issue
      //intersect the two groups to get the result set
      //we are interested in commits that are both on the current branch and related to the issue
      let relevantCommits = branchCommits.filter((commit) => {
        //if a commits parent string contains a comma, it has more than one parent -> it is a merge commit
        if (filterMergeCommits && commit.parents.includes(',')) {
          return false;
        }
        return relevantCommitsHashes.includes(commit.sha);
      });

      if (relevantCommits.length === 0) {
        return result;
      }

      //########### add build data to commits ###########
      relevantCommits = addBuildData(relevantCommits, builds);

      //########### extract data for each stakeholder ###########

      //first group all relevant commits by stakeholder
      const commitsByStakeholders = _.groupBy(relevantCommits, (commit) => commit.signature);

      for (const stakeholder in commitsByStakeholders) {
        result['devData'][stakeholder] = {};

        //add commits to each stakeholder
        result['devData'][stakeholder]['commits'] = commitsByStakeholders[stakeholder];

        //initialize linesOwned with 0. If program runs in online mode, this will be updated later
        result['devData'][stakeholder]['linesOwned'] = 0;

        //for each stakeholder, sum up relevant additions
        result['devData'][stakeholder]['additions'] = _.reduce(
          commitsByStakeholders[stakeholder],
          (sum, commit) => {
            if (mode === 'issues') {
              //we are interested in all additions made in each commit
              return sum + commit.stats.additions;
            } else {
              //we are only interested in the additions made to the currently active files
              const relevantFiles = commit.files.data.filter((f) => activeFiles.includes(f.file.path));
              //if at least one exists, return the respective additions
              if (relevantFiles && relevantFiles.length > 0) {
                return sum + _.reduce(relevantFiles, (fileSum, file) => fileSum + file.stats.additions, 0);
              } else {
                console.log('error in fetchCodeExpertiseData: relevantFile does not exist');
                return sum + 0;
              }
            }
          },
          0
        );
      }

      //########### add ownership data to commits ###########

      //if the program runs in offline mode, don't add ownership data since this requires a back end connection
      if (offlineMode) {
        return result;
      }

      let ownershipDataPromise;

      if (mode === 'issues') {
        //get latest relevant commit of the branch
        const latestRelevantCommit = relevantCommits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        //hashes of all relevant commits
        const hashes = relevantCommits.map((commit) => commit.sha);
        ownershipDataPromise = Promise.resolve(getFilesForCommits(hashes)).then((files) =>
          getBlameIssues(
            latestRelevantCommit.sha,
            files.map((file) => file.file.path),
            hashes
          )
        );
      } else {
        //get latest commit of the branch
        const latestBranchCommit = branchCommits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        ownershipDataPromise = Promise.resolve(getBlameModules(latestBranchCommit.sha, activeFiles));
      }

      return ownershipDataPromise
        .then((res) => {
          Object.entries(res.blame).map((item) => {
            const devMail = item[0];
            const linesOwned = item[1];

            //add to dev object
            for (const stakeholder in commitsByStakeholders) {
              if (stakeholder.includes('<' + devMail + '>')) {
                result['devData'][stakeholder]['linesOwned'] = linesOwned;
                break;
              }
            }
          });
        })
        .then((_) => {
          return result;
        });
    });
  },
  requestCodeExpertiseData,
  receiveCodeExpertiseData,
  receiveCodeExpertiseDataError
);
