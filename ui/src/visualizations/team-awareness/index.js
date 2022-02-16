'use strict';

import TeamAwarenessComponent from './chart';
import ConfigComponent from './config';
import HelpComponent from './help';
import saga from './sagas';
import reducer from './reducers';
import { connect } from 'react-redux';

const mapStateToProps = () => {
  return {};
};
const mapDispatchToProps = () => {
  return {};
};

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(TeamAwarenessComponent);

export default {
  id: 'teamAwareness',
  label: 'Team Awareness',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent
};
