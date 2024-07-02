'use-strict';

import { connect } from 'react-redux';

import Chart from './chart';

const mapStateToProps = (state) => {
  const mergeRequestLifeCycleState = state.visualizations.mergeRequestLifeCycle.state;
  return {
    mergeRequests: mergeRequestLifeCycleState.data.data.mergeRequests,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
