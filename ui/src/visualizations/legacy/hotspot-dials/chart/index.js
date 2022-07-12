'use strict';

import { connect } from 'react-redux';
import Chart from './chart.js';

const mapStateToProps = (state) => {
  const hdState = state.visualizations.hotspotDials.state;
  const universalSettings = state.visualizations.newDashboard.state.config;

  return {
    splitCommits: hdState.config.splitCommits,
    commits: {
      categories: hdState.data.data.commits.categories,
      maximum: hdState.data.data.commits.maximum,
    },
    issues: {
      categories: hdState.data.data.issues.categories,
      maximum: hdState.data.data.issues.maximum,
    },
    issueField: hdState.config.issueField,
    chartResolution: universalSettings.chartResolution,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
