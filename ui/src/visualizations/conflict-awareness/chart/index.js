'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import {
  getCherryPickCheck,
  getDiff,
  getMergeCheck,
  getRebaseCheck,
  resetStateProperty,
  updateConflictAwarenessData,
} from '../sagas';

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    commits: caState.data.data.commits, // the commits of the base project and the parent/fork (if one was selected)
    branches: caState.data.data.branches, // the branches of the base project and the parent/fork (if one was selected)
    branchesBaseProject: caState.data.data.branchesBaseProject, // the branch names of the base project, and a flag if they are checked in the config
    branchesOtherProject: caState.data.data.branchesOtherProject, // the branch names of the parent/fork (if one was selected), and a flag if they are checked in the config
    excludedBranchesBaseProject: caState.config.excludedBranchesBaseProject, // the branches of the base project which should be excluded from the graph
    excludedBranchesOtherProject: caState.config.excludedBranchesOtherProject, // the branches of the other project which should be excluded from the graph
    diff: caState.data.data.diff, // the diffs of a commit
    issues: caState.data.data.issues, // the issues of the base project for the filter list
    rebaseCheck: caState.data.data.rebaseCheck, // the result of the rebase check
    mergeCheck: caState.data.data.mergeCheck, // the result of the merge check
    cherryPickCheck: caState.data.data.cherryPickCheck, // the result of the cherry pick check
    colorBaseProject: caState.config.color.baseProject, // the color for the commits/edges of the base project
    colorOtherProject: caState.config.color.otherProject, // the color for the commits/edges of the parent/fork
    colorCombined: caState.config.color.combined, // the color of the commits/edges found in both projects
    otherProject: caState.config.otherProject, // the selected parent/fork
    issueForFilter: caState.config.issueForFilter, // the issueID whose commits should be highlighted
    repoFullName: `${state.config.data.repoOwner}/${state.config.data.repoName}`, // the name of the base repo (owner/repository name)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onResetStateProperty: (stateProperty) => dispatch(resetStateProperty(stateProperty)),
    onGetDiff: (commitSha) => dispatch(getDiff(commitSha)),
    onUpdateConflictAwarenessData: (repoFullName) =>
      dispatch(updateConflictAwarenessData([repoFullName], true)),
    onCheckRebase: (headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch) =>
      dispatch(getRebaseCheck(headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch)),
    onCheckMerge: (fromRepo, fromBranch, toRepo, toBranch) =>
      dispatch(getMergeCheck(fromRepo, fromBranch, toRepo, toBranch)),
    onCheckCherryPick: (cherryPickCommitInfos, otherRepo, toRepo, toBranch) =>
      dispatch(getCherryPickCheck(cherryPickCommitInfos, otherRepo, toRepo, toBranch)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
