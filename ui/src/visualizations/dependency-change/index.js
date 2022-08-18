'use strict'

import { connect } from 'react-redux';
import DependencyChanges from './chart/chart.js';
import ConfigComponent from './config/config.js';
import HelpComponent from './help.js';
import saga, { setActiveBranch, setActiveFile, setActiveFiles, setActivePath, setActiveBranches, setActiveCompareBranch } from './sagas';
import reducer from './reducers';

const mapStateToProps = state => {
  const State = state.visualizations.dependencyChanges.state;
  return {
    fileURL: State.data.data.fileURL,
    branch: State.data.data.branch,
    compareBranch: State.data.data.compareBranch,
    path: State.data.data.path,
    files: State.data.data.files,
    branches: State.data.data.branches
  };
};

const mapDispatchToProps = dispatch => ({
  onSetFile: url => dispatch(setActiveFile(url)),
  onSetPath: path => dispatch(setActivePath(path)),
  onSetBranch: branch => dispatch(setActiveBranch(branch)),
  onSetCompareBranch: compareBranch => dispatch(setActiveCompareBranch(compareBranch)),
  onSetFiles: files => dispatch(setActiveFiles(files)),
  onSetBranches: branches => dispatch(setActiveBranches(branches))
});

const ChartComponent = connect(mapStateToProps, mapDispatchToProps)(DependencyChanges);

export default {
    id: 'dependencyChanges',
    label: 'Dependency Changes',
    saga,
    reducer,
    ChartComponent,
    ConfigComponent,
    HelpComponent
};