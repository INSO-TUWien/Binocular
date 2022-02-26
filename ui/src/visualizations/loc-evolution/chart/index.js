'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';
import { setViewport, openCommit } from '../sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.locEvolution.state;
  const elements = ["File12", "File22", "File32"]; // IT IS THIS ONE HERE - muss es nor vor dem anderen herkrigen, dann ist es nicht mehr undefined et voilà!!
  corState.elements = elements;
  state.visualizations.locEvolution.state.elements = elements;

  return {
    highlightedFolder: corState.config.highlightedFolder,
    elements: corState.elements
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onCommitClick: function(c) {
      dispatch(openCommit(c));
    },
    onViewportChanged: function(v) {
      dispatch(setViewport(v));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
