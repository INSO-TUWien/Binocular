'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import {
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
    diff: caState.data.data.diff, // the diffs of a commit
    issues: caState.data.data.issues, // the issues of the base project for the filter list
    rebaseCheck: caState.data.data.rebaseCheck, // the result of the rebase check
    mergeCheck: caState.data.data.mergeCheck, // the result of the merge check
    colorBaseProject: caState.config.color.baseProject, // the color for the commits/edges of the base project
    colorOtherProject: caState.config.color.otherProject, // the color for the commits/edges of the parent/fork
    colorCombined: caState.config.color.combined, // the color of the commits/edges found in both projects
    otherProject: caState.config.otherProject, // the selected parent/fork
    issueForFilter: caState.config.issueForFilter, // the issueID whose commits should be highlighted
    repoFullName: `${state.config.data.repoOwner}/${state.config.data.repoName}`, // the name of the base repo (owner/repository name)
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onResetStateProperty: (stateProperty) => dispatch(resetStateProperty(stateProperty)),
    onGetDiff: (commitSha) => dispatch(getDiff(commitSha)),
    onUpdateConflictAwarenessData: (repoFullName) =>
      dispatch(updateConflictAwarenessData([repoFullName], true)),
    onCheckRebase: (headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch) =>
      dispatch(getRebaseCheck(headSha, rebaseRepo, rebaseBranch, upstreamRepo, upstreamBranch)),
    onCheckMerge: (fromRepo, fromBranch, toRepo, toBranch) =>
      dispatch(getMergeCheck(fromRepo, fromBranch, toRepo, toBranch)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
