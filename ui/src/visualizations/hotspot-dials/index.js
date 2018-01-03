'use strict';

import { connect } from 'react-redux';
import HotspotDials from './chart.js';
import ConfigComponent from './config.js';
import saga from './sagas';
import reducer from './reducers';

const mapStateToProps = state => {
  const hdState = state.visualizations.hotspotDials.state;

  return {
    splitCommits: hdState.config.splitCommits,
    commits: {
      categories: hdState.data.data.commits.categories,
      maximum: hdState.data.data.commits.maximum
    },
    issues: {
      categories: hdState.data.data.issues.categories,
      maximum: hdState.data.data.issues.maximum
    }
  };
};

const mapDispatchToProps = () => ({});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(HotspotDials);

export default {
  id: 'hotspotDials',
  label: 'HotspotDials',
  ChartComponent,
  ConfigComponent,
  saga,
  reducer
};
