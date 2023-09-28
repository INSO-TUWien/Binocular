'use strict';

import { connect } from 'react-redux';
import FileEvolutionDendrogram from './chart/chart.js';
import ConfigComponent from './config/config.js';
import HelpComponent from './help.js';
import saga, { setActiveBranch, setActiveFile, setActiveFiles, setActivePath, setActiveBranches } from './sagas';
import reducer from './reducers';

const mapStateToProps = (state) => {
  const State = state.visualizations.fileEvolutionDendrogram.state;
  console.log("mapstatetoprops");
  console.log(State);
  return {
    fileURL: State.data.data.fileURL,
    branch: State.data.data.branch,
    path: State.data.data.path,
    files: State.data.data.files,
    branches: State.data.data.branches,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onSetFile: (url) => dispatch(setActiveFile(url)),
  onSetPath: (path) => dispatch(setActivePath(path)),
  onSetBranch: (branch) => dispatch(setActiveBranch(branch)),
  onSetFiles: (files) => dispatch(setActiveFiles(files)),
  onSetBranches: (branches) => dispatch(setActiveBranches(branches)),
});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(FileEvolutionDendrogram);

export default {
  id: 'fileEvolutionDendrogram',
  label: 'File Evolution Dendrogram',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
