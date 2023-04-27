import { createAction } from 'redux-actions';
import { select, throttle, fork, takeEvery } from 'redux-saga/effects';
import _ from 'lodash';

import { fetchFactory, timestampedActionFactory, mapSaga } from '../../../sagas/utils.js';

import {
  getAllCommits,
  getCommitsForBranch,
  getCommitsForIssue,
  getIssueData,
  getAllBuildData,
  addBuildData,
  getBlameModules,
  getBlameIssues,
  getBranches,
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


    console.log("OFFLINE MODE: ", offlineMode)

    const result = {
      devData: {},
      issue: null,
    };

    if (branch === null) return result;

    if (mode === 'issues') {
      if (issueId === null) return result;

      return yield Promise.all([
        getAllCommits(),
        getIssueData(issueId),
        getCommitsForIssue(issueId),
        getAllBuildData(),
        getBranches(),
      ]).then((results) => {
        const allCommits = results[0];
        const issue = results[1];
        const issueCommits = results[2];
        const builds = results[3];
        const branches = results[4];
        //########### current issue ###########
        result['issue'] = issue;

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

          return issueCommits.map((c) => c.sha).includes(commit.sha);
        });

        if (relevantCommits.length === 0) {
          return result;
        }

        //########### add build data to commits ###########
        relevantCommits = addBuildData(relevantCommits, builds);

        const issueFiles = new Set();

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
              //while we are at it, add all files of the commit to issueFiles for later
              commit.files.data.map((file) => {
                issueFiles.add(file.file.path);
              });

              //we are interested in all additions made in each commit
              return sum + commit.stats.additions;
            },
            0
          );
        }

        //########### add ownership data to commits ###########

        //if the program runs in offline mode, don't add ownership data since this requires a back end connection
        if(offlineMode)  {
          return result;
        }

        //get latest commit of the branch
        const latestRelevantCommit = relevantCommits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        //hashes of all commits related to the issue
        const hashes = relevantCommits.map((commit) => commit.sha);

        return Promise.resolve(getBlameIssues(latestRelevantCommit.sha, [...issueFiles], hashes))
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
    } else if (mode === 'modules') {
      if (activeFiles === null || activeFiles.length === 0) return result;

      return yield Promise.all([getAllCommits(), getAllBuildData(), getBranches()]).then((results) => {
        const allCommits = results[0];
        const builds = results[1];
        const branches = results[2];
        //########### get all relevant commits ###########
        //get full branch object for current branch
        const currentBranchObject = branches.filter((b) => b.branch === branch)[0];

        //contains all commits of the current branch
        const branchCommits = getCommitsForBranch(currentBranchObject, allCommits);

        //we now have all commits for the current branch and all commits for the file
        //intersect the two groups to get the result set

        //we are interested in commits that are both on the current branch and related to the current file/module
        let relevantCommits = branchCommits.filter((c) => {
          //if a commits parent string contains a comma, it has more than one parent -> it is a merge commit
          if (filterMergeCommits && c.parents.includes(',')) {
            return false;
          }

          //extract all filepaths of the commit
          const filePathsTouchedByCommit = c.files.data.map((fileObject) => fileObject.file.path);
          //if the resulting array includes one of the active files, this commit is relevant
          let relevantFlag = false;
          activeFiles.map((file) => {
            if (filePathsTouchedByCommit.includes(file)) {
              relevantFlag = true;
            }
          });
          return relevantFlag;
        });

        if (relevantCommits.length === 0) {
          console.log('no relevant commits');
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
              //we are only interested in the additions made to the currently active files
              const relevantFiles = commit.files.data.filter((f) => activeFiles.includes(f.file.path));
              //if at least one exists, return the respective additions
              if (relevantFiles && relevantFiles.length > 0) {
                const tempSum = _.reduce(
                  relevantFiles,
                  (fileSum, file) => {
                    return (
                      fileSum +
                      _.reduce(
                        file.hunks,
                        (hunkSum, hunk) => {
                          return hunkSum + hunk.newLines;
                        },
                        0
                      )
                    );
                  },
                  0
                );
                return sum + tempSum;
              } else {
                console.log('error in fetchCodeExpertiseData: relevantFile does not exist');
                return sum + 0;
              }
            },
            0
          );
        }

        //########### add ownership data to commits ###########

        //if the program runs in offline mode, don't add ownership data since this requires a back end connection
        if(offlineMode)  {
          return result;
        }

        //get latest commit of the branch
        const latestBranchCommit = branchCommits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        return Promise.resolve(getBlameModules(latestBranchCommit.sha, activeFiles))
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
    } else {
      console.log('error in fetchCodeExpertiseData: invalid mode: ' + mode);
      return result;
    }
  },
  requestCodeExpertiseData,
  receiveCodeExpertiseData,
  receiveCodeExpertiseDataError
);
