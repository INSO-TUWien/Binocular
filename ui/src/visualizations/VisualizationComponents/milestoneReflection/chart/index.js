'use strict';

import { connect } from 'react-redux';

import Chart from './chart.js';

import MilestoneReflection from './chart';

const mapStateToProps = (state) => {
  const dashboardState = state.visualizations.milestoneReflection.state;

  return {
    config: {
      issueInfo: dashboardState.config.issueInfo,
      milestone: dashboardState.config.milestone,
      issues: dashboardState.config.issues,
    },
    issues: ['1', '2'],
  };
};

const mapDispatchToProps = (/*dispatch , ownProps*/) => {
  return {};
};

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(MilestoneReflection);

export default ChartComponent;
