'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';

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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
