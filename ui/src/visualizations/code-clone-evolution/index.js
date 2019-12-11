'use strict';

import { connect } from 'react-redux';
import CodeCloneEvolution from './chart.js';
import ConfigComponent from './config.js';
import HelpComponent from './help.js';
import saga from './sagas';
import reducer from './reducers';

const mapStateToProps = state => {
  const cceState = state.visualizations.codeCloneEvolution.state;

  return {
    clone: cceState.config.clone,
    startRevision: cceState.config.startRevision,
    endRevision: cceState.config.enRevision,
    package: cceState.config.package,
    cloneType: cceState.config.cloneType
  };
};

const mapDispatchToProps = () => ({});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(CodeCloneEvolution);

export default {
  id: 'codeCloneEvolution',
  label: 'Code Clone Evolution',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent
};
