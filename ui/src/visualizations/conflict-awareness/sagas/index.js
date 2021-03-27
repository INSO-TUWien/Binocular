'use strict';

import {createAction} from 'redux-actions';
import {fetchFactory, timestampedActionFactory} from '../../../sagas/utils';
import Promise from 'bluebird';
import getCommitData from './get-commit-data';
import getBranchData from './get-branch-data';
import {endpointUrl} from '../../../utils';
import {fork, takeEvery} from 'redux-saga/effects';
import getParentAndForks from './get-parent-and-forks';
import indexProject from './index-project';
import getIssueData from './get-issue-data';

export const setIsLoading = createAction('SET_IS_LOADING', (isLoading) => isLoading);

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

// adds/removes a branch of the base project to/from the excluded branches list
export const switchExcludedBranchesBaseProject = createAction(
  'SWITCH_EXCLUDED_BRANCHES_BASE_PROJECT',
  (switchedBranch) => switchedBranch
);

// adds/removes a branch of the other project to/from the excluded branches list
export const switchExcludedBranchesOtherProject = createAction(
  'SWITCH_EXCLUDED_BRANCHES_OTHER_PROJECT',
  (switchedBranch) => switchedBranch
);

// toggles the checked property of a branch in the base project
export const switchBranchCheckedBaseProject = createAction(
  'SWITCH_BRANCH_CHECKED_BASE_PROJECT',
  (branch) => branch
);

// toggles the checked property of a branch in the other project
export const switchBranchCheckedOtherProject = createAction(
  'SWITCH_BRANCH_CHECKED_OTHER_PROJECT',
  (branch) => branch
);

// switches the checked flag of all branches of the base project to isChecked
export const switchAllBranchCheckedBaseProject = createAction(
  'SWITCH_ALL_BRANCH_CHECKED_BASE_PROJECT',
  (isChecked) => isChecked
);

// switches the checked flag of all branches of the other project to isChecked
export const switchAllBranchCheckedOtherProject = createAction(
  'SWITCH_ALL_BRANCH_CHECKED_OTHER_PROJECT',
  (isChecked) => isChecked
);

// switches the checked property of the show all branches checkbox for the base project
// and sets the excluded branches of the base project accordingly
export const switchShowAllBranchesBaseProject = createAction(
  'SWITCH_SHOW_ALL_BRANCHES_BASE_PROJECT',
  (isChecked, branches) => {
    return { isChecked, branches };
  }
);

// switches the checked property of the show all branches checkbox for the other project
// and sets the excluded branches of the other project accordingly
export const switchShowAllBranchesOtherProject = createAction(
  'SWITCH_SHOW_ALL_BRANCHES_OTHER_PROJECT',
  (isChecked, branches) => {
    return { isChecked, branches };
  }
);

// sets the filterBeforeDate element
export const setFilterBeforeDate = createAction(
  'SET_FILTER_BEFORE_DATE',
  (filterBeforeDate) => filterBeforeDate
);

// sets the filterAfterDate element
export const setFilterAfterDate = createAction(
  'SET_FILTER_AFTER_DATE',
  (filterAfterDate) => filterAfterDate
);

// sets the filterAuthor element
export const setFilterAuthor = createAction('SET_FILTER_AUTHOR', (filterAuthor) => filterAuthor);

// sets the filterCommitter element
export const setFilterCommitter = createAction(
  'SET_FILTER_COMMITTER',
  (filterCommitter) => filterCommitter
);

// sets the filterSubtree element
export const setFilterSubtree = createAction(
  'SET_FILTER_SUBTREE',
  (filterSubtree) => filterSubtree
);

// sets the collapsed sections of the graph
export const setCollapsedSections = createAction(
  'SET_COLLAPSED_SECTIONS',
  (collapsedSections) => collapsedSections
);

// sets the flag indicating to compact the whole graph
export const setCompactAll = createAction(
  'SET_COMPACT_ALL',
  (shouldCompactAll) => shouldCompactAll
);

// sets the flag indicating to expand the whole graph
export const setExpandAll = createAction('SET_EXPAND_ALL', (shouldExpandAll) => shouldExpandAll);

// sets the information which compactedNode should be expanded
export const expandCollapsedNode = createAction(
  'EXPAND_COLLAPSED_NODE',
  (nodeToExpand) => nodeToExpand
);

// sets the commit sha which commit section should be compacted
export const setNodeToCompactSection = createAction(
  'SET_NODE_TO_COMPACT_SECTION',
  (nodeToCompactSection) => nodeToCompactSection
);

// sets the information of the branches heads
export const setBranchesHeadShas = createAction(
  'SET_BRANCHES_HEAD_SHAS',
  (branchesHeadShas) => branchesHeadShas
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

// get the commit shas the requested commit depends on (not recursive)
export const requestCommitDependencies = createAction('REQUEST_COMMIT_DEPENDENCIES');
export const receiveCommitDependencies = timestampedActionFactory('RECEIVE_COMMIT_DEPENDENCIES');
export const getCommitDependencies = createAction('GET_COMMIT_DEPENDENCIES', (sha) => {
  return { sha };
});

// inits all watchers
export default function* () {
  yield fork(watchDiff);
  yield fork(watchUpdateConflictAwarenessData);
  yield fork(watchCheckRebase);
  yield fork(watchCheckMerge);
  yield fork(watchCheckCherryPick);
  yield fork(watchGetCommitDependencies);
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
        // calculate each branch ref
        branches.forEach((branch) => {
          branch.branchRef = branch.branchName
            .split('/')
            .map((split) => split.substring(0, 3))
            .join('/');
        });

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
        // the branch names of the base project and a flag if they are checked in the config section
        data.branchesBaseProject = branches
          .filter(
            (branch) =>
              branch.headShas.filter((headSha) => headSha.project === projects[0]).length > 0
          )
          .map((branch) => {
            return { branchRef: branch.branchRef, branchName: branch.branchName, checked: true };
          });

        // the branches of the other project (if selected) and a flag if they are checked in the config section
        if (projects[1]) {
          data.branchesOtherProject = branches
            .filter(
              (branch) =>
                branch.headShas.filter((headSha) => headSha.project === projects[1]).length > 0
            )
            .map((branch) => {
              return { branchRef: branch.branchRef, branchName: branch.branchName, checked: true };
            });
        }

        // get the distinct committers of all commits
        const committers = [];
        commits
          .map((commit) => commit.signature)
          .forEach((committer) => {
            if (!committers.includes(committer)) {
              committers.push(committer);
            }
            data.committers = committers;
          });

        // get the distinct authors of all commits
        const authors = [];
        commits
          .map((commit) => commit.author)
          .forEach((author) => {
            if (!authors.includes(author)) {
              authors.push(author);
            }
            data.authors = authors;
          });

        // set the trigger to compact the whole graph
        data.compactAll = true;
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
 * Gets the shas of the commits, the requested commit depends on (not recursive).
 * If the commit dependencies cannot be retrieved, success = false.
 */
export const fetchCommitDependencies = fetchFactory(
  function (sha) {
    return fetch(endpointUrl('commit/dependencies'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha,
      }),
    }).then((resp) => resp.json());
  },
  requestCommitDependencies,
  receiveCommitDependencies
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
 * Watches all getCommitDependencies actions and retrieved all commit shas the requested commit depends on (not recursive).
 */
export function* watchGetCommitDependencies() {
  yield takeEvery('GET_COMMIT_DEPENDENCIES', function* (a) {
    yield* fetchCommitDependencies(a.payload.sha);
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
