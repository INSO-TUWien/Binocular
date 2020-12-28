'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { getDiff, updateConflictAwarenessData } from '../sagas';

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    commits: caState.data.data.commits, // the commits of the base project and the parent/fork (if one was selected)
    branches: caState.data.data.branches, // the branches of the base project and the parent/fork (if one was selected)
    diffs: caState.data.data.diffs, // the diffs of a commit
    colorBaseProject: caState.config.color.baseProject, // the color for the commits/edges of the base project
    colorOtherProject: caState.config.color.otherProject, // the color for the commits/edges of the parent/fork
    colorCombined: caState.config.color.combined, // the color of the commits/edges found in both projects
    otherProject: caState.config.otherProject, // the selected parent/fork
    repoFullName: `${state.config.data.repoOwner}/${state.config.data.repoName}`, // the name of the base repo (owner/repository name)
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onGetDiff: (commitSha) => dispatch(getDiff(commitSha)),
    onUpdateConflictAwarenessData: (repoFullName) =>
      dispatch(updateConflictAwarenessData([repoFullName], true)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
