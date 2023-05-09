'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state) => {
  return {
    fileTreeHistory: state.visualizations.fileTreeEvolution.state.data.data.fileTreeHistory || [],
    commits: state.visualizations.fileTreeEvolution.state.data.data.commits,
    contributors: state.visualizations.fileTreeEvolution.state.data.data.contributors
  };
};

export default connect(mapStateToProps)(Chart);