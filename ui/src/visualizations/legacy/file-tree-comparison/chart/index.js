'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';
import { setCommit1, setCommit2 } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.fileTreeComparison.state;
  return {
    commits: corState.data.data.commits,
    commit1: corState.config.commit1,
    commit2: corState.config.commit2,
    tree1: corState.config.tree1,
    tree2: corState.config.tree2,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSetCommit1: (commit) => dispatch(setCommit1(commit)),
    onSetCommit2: (commit) => dispatch(setCommit2(commit)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
