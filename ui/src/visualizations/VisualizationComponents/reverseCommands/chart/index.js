'use strict';

import { connect } from 'react-redux';
import Chart from './konva_chart.js';
import { setActiveBranch, setActiveBranches } from '../../../legacy/code-hotspots/sagas';
import { setSelectedBranches } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const reverseCommands = state.visualizations.reverseCommands.state;
  const universalSettings = state.universalSettings;
  return {
    otherCount: reverseCommands.data.data.otherCount,
    filteredCommits: reverseCommands.data.data.filteredCommits,
    commits: reverseCommands.data.data.commits,
    committers: reverseCommands.data.data.committers,
    commitAttribute: reverseCommands.config.commitAttribute,
    firstCommitTimestamp: reverseCommands.data.data.firstCommitTimestamp,
    lastCommitTimestamp: reverseCommands.data.data.lastCommitTimestamp,
    firstSignificantTimestamp: reverseCommands.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: reverseCommands.data.data.lastSignificantTimestamp,
    displayMetric: reverseCommands.config.displayMetric,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    otherAuthors: universalSettings.otherAuthors,
    mergedAuthors: universalSettings.mergedAuthors,
    chartResolution: universalSettings.chartResolution,
    branches: reverseCommands.data.data.branches,
    selectedBranches: reverseCommands.data.data.selectedBranches,
    shapes: [],
    graph_konva: [],
    isDrawingLine: false,
    startLinePoint: { x: 0, y: 0 },
    endLinePoint: { x: 0, y: 0 },
  };
};

const mapDispatchToProps = (dispatch) => ({
  onSetBranch: (branch) => dispatch(setActiveBranch(branch)),
  onSetBranches: (branches) => dispatch(setActiveBranches(branches)),
  onSetSelectedBranches: (selectedBranches) => dispatch(setSelectedBranches(selectedBranches)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
