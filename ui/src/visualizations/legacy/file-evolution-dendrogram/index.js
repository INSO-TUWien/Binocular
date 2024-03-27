'use strict';

import { connect } from 'react-redux';
import FileEvolutionDendrogram from './chart/chart.js';
import ConfigComponent from './config/config.js';
import HelpComponent from './help.js';
import saga from './sagas';
import reducer from './reducers';

const mapStateToProps = (state) => {
  const State = state.visualizations.fileEvolutionDendrogram.state;
  return {
    files: State.data.data.files,
    palette: State.data.data.palette,
    displayMetric: State.config.displayMetric,
    displayByAuthors: State.config.displayByAuthors,
    omitFiles: State.config.omitFiles,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(FileEvolutionDendrogram);

export default {
  id: 'fileEvolutionDendrogram',
  label: 'File Evolution Tree',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
