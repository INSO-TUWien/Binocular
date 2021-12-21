'use strict';

import {connect} from 'react-redux';
import ActiveConflictAwareness from './chart.js';
import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga from './sagas';
import reducer from './reducers';


const mapStateToProps = state => {

  return {

  };
};


const mapDispatchToProps = () => ({});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(ActiveConflictAwareness);

export default {
  id: 'activeConflictAwareness',
  label: 'Active Conflict Awareness',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
