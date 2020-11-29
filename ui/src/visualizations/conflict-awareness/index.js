'use strict';

import { connect } from 'react-redux';
import ConflictAwareness from './chart.js';
import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga, { setColor } from './sagas';
import reducer from './reducers';

const mapStateToProps = (state) => {
  const caState = state.visualizations.conflictAwareness.state;

  return {
    colorBaseProject: caState.config.color.baseProject,
    colorOtherProject: caState.config.color.otherProject,
    colorCombined: caState.config.color.combined,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onSetColor: (color, key) => dispatch(setColor(color, key)),
});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(ConflictAwareness);

export default {
  id: 'conflictAwareness',
  label: 'Conflict Awareness',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
