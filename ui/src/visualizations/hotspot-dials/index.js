'use strict';

import { connect } from 'react-redux';
import HotspotDials from './chart.js';

const mapStateToProps = state => {
  return {
    commits: {
      categories: state.hotspotDialsData.data.commits.categories,
      maximum: state.hotspotDialsData.data.commits.maximum
    },
    issues: {
      categories: state.hotspotDialsData.data.issues.categories,
      maximum: state.hotspotDialsData.data.issues.maximum
    }
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(HotspotDials);
