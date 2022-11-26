'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';


const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.fileTreeComparison.state;
  //console.log(corState);
  return {
    commits: corState.data.data,

  }
  ;
};


export default connect(mapStateToProps)(Chart);
