'use strict';

import { connect } from 'react-redux';

import { setActiveFile, setActivePath, setActiveBranch, setActiveCompareBranch } from '../sagas';
import styles from '../styles.scss';
import FileBrowser from '../components/fileBrowser/fileBrowser';

const mapStateToProps = (state /*, ownProps*/) => {
  const State = state.visualizations.dependencyChanges.state;

  return {
    fileURL: State.data.data.fileURL,
    path: State.data.data.path,
    branch: State.data.data.branch,
    compareBranch: State.data.data.compareBranch,
    files: State.data.data.files,
    branches: State.data.data.branches
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetFile: url => dispatch(setActiveFile(url)),
    onSetPath: path => dispatch(setActivePath(path)),
    onSetBranch: branch => dispatch(setActiveBranch(branch)),
    onSetCompareBranch: compareBranch => dispatch(setActiveCompareBranch(compareBranch))
  };
};

const DependencyChangesConfigComponent = props => {
  const options = [];
  for (const i in props.branches) {
    options.push(
      <option key={i}>
        {props.branches[i].branch}
      </option>
    );
  }

  const filteredFiles = props.files.filter(f => f.key.endsWith('.js') || f.key.endsWith('.java') || f.key.endsWith('.py'));
  return (
    <div className={styles.config}>
      <div className={styles.label}>Current Branch:</div>
      <div id={'branchSelector'} className={'select ' + styles.branchSelect}>
        <select
          className={styles.branchSelect}
          value={props.branch}
          onChange={e => {
            props.onSetBranch(e.target.value);
          }}>
          {options}
        </select>
      </div>
      <hr />
      <div className={styles.label}> Compare to:</div>
      <div id={'compareBranchSelector'} className={'select ' + styles.branchSelect}>
        <select
          className={styles.branchSelect}
          value={props.compareBranch}
          onChange={e => {
            props.onSetCompareBranch(e.target.value);
          }}>
          {options}
        </select>
      </div>
      <hr />
      <div id={'fileSelector'}>
        <FileBrowser files={filteredFiles} props={props} />
      </div>
    </div>
  );
};

const DependencyChangesConfig = connect(mapStateToProps, mapDispatchToProps)(DependencyChangesConfigComponent);

export default DependencyChangesConfig;
