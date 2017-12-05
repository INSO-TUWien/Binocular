'use strict';

import { connect } from 'react-redux';
import HotspotDials from './chart.js';

const mapStateToProps = state => {
  console.log('mapping', state.hotspotDialsData.data);
  return {
    categories: state.hotspotDialsData.data.categories,
    maximum: state.hotspotDialsData.data.maximum
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(HotspotDials);
