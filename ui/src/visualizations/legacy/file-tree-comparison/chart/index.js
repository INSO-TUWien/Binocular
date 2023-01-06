'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';
import { setFilter, setChanged } from '/ui/src/visualizations/legacy/file-tree-comparison/sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.fileTreeComparison.state;
  return {
    commits: corState.data.data.commits,
    commit1: corState.config.commit1,
    commit2: corState.config.commit2,
    tree1: corState.config.tree1,
    tree2: corState.config.tree2,
    filter: corState.config.filter,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onSetFilter: (f) => dispatch(setFilter(f)),
  onSetChanged: (changes) => dispatch(setChanged(changes)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
