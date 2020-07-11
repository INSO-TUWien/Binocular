'use strict';

import {
  connect
} from 'react-redux';
import CodeHotspots from './chart.js';
import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga, {
  changeFile
} from './sagas';
import reducer from './reducers';


const mapStateToProps = state => {
  const iiState = state.visualizations.codeHotspots.state;
  return {
    fileURL: iiState.data.data.fileURL,
    branch: iiState.data.data.branch
  };
};

const mapDispatchToProps = dispatch => ({
});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(CodeHotspots);

export default {
  id: 'codeHotspots',
  label: 'Code Hotspots',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent
};
