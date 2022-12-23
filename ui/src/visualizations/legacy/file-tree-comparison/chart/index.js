'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';
import { setCommit1, setCommit2, setTree1, setTree2, setChanged } from '/ui/src/visualizations/legacy/file-tree-comparison/sagas';

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

const mapDispatchToProps = (dispatch) => ({
  onSetCommit1: (commit) => dispatch(setCommit1(commit)),
  onSetCommit2: (commit) => dispatch(setCommit2(commit)),
  onSetTree1: (tree) => dispatch(setTree1(tree)),
  onSetTree2: (tree) => dispatch(setTree2(tree)),
  onSetChanged: (changes) => dispatch(setChanged(changes)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
