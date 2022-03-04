'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport, openCommit } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const locState = state.visualizations.locEvolution.state;

  return {
    highlightedFolder: locState.config.highlightedFolder
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCommitClick: function(c) {
      dispatch(openCommit(c));
    },
    onChangeFolderName: function(folder) {
      dispatch(setActiveFolder(folder))
    } 
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
