'use strict';

import { connect } from 'react-redux';

import { setActiveFile, setActivePath, setActiveBranch } from '../sagas';
import styles from '../styles.scss';
import FileBrowser from '../components/fileBrowser/fileBrowser';

const mapStateToProps = (state /*, ownProps*/) => {
  const State = state.visualizations.fileEvolutionDendrogram.state;
  console.log("configmapstatetoprops");
  console.log(State);
  console.log(State.data.data.files);

  return {
    fileURL: State.data.data.fileURL,
    path: State.data.data.path,
    branch: State.data.data.branch,
    files: State.data.data.files,
    branches: State.data.data.branches,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetFile: (url) => dispatch(setActiveFile(url)),
    onSetPath: (path) => dispatch(setActivePath(path)),
    onSetBranch: (branch) => dispatch(setActiveBranch(branch)),
  };
};

const FileEvolutionDendrogramConfigComponent = (props) => {
  console.log("test config");
  console.log(props);
  const options = [];
  for (const i in props.branches) {
    options.push(<option key={i}>{props.branches[i].branch}</option>);
  }
  return (
    <div className={styles.config}>
      <div className={styles.label}> Branch:</div>
      <div id={'branchSelector'} className={'select ' + styles.branchSelect}>
        <select
          className={styles.branchSelect}
          value={props.branch}
          onChange={(e) => {
            props.onSetBranch(e.target.value);
          }}>
          {options}
        </select>
      </div>
      <hr />
      <div id={'fileSelector'}>
        <FileBrowser files={props.files} props={props} />
      </div>
    </div>
  );
};

const FileEvolutionDendrogramConfig = connect(mapStateToProps, mapDispatchToProps)(FileEvolutionDendrogramConfigComponent);

export default FileEvolutionDendrogramConfig;
