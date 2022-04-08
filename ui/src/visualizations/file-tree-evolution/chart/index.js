'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

const mapStateToProps = (state) => {
  return {
    fileTreeHistory: state.visualizations.fileTreeEvolution.state.data.data.fileTreeHistory || []
  };
};

export default connect(mapStateToProps)(Chart);