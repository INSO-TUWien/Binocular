'use strict';

import { connect } from 'react-redux';
import CodeHotspots from './chart/chart';
import ConfigComponent from './config/config';
import HelpComponent from './help';
import saga, { setActiveBranch, setActiveFile, setActiveFiles, setActivePath, setActiveBranches } from './sagas';
import reducer from './reducers';

const mapStateToProps = (state) => {
  const State = state.visualizations.codeHotspots.state;
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

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(CodeHotspots);

export default {
  id: 'codeHotspots',
  label: 'Code Hotspots',
  saga,
  reducer,
  ChartComponent,
  ConfigComponent,
  HelpComponent,
};
