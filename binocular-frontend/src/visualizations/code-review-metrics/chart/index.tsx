'use-strict';

import { connect } from 'react-redux';

import Chart from './chart';

const mapStateToProps = (state) => {
  const codeReviewMetricsState = state.visualizations.codeReviewMetrics.state;
  return {
    mergeRequests: codeReviewMetricsState.data.data.mergeRequests,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
