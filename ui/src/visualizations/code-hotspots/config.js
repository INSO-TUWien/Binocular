'use strict';

import {
  connect
} from 'react-redux';

import {
  setActiveFile,
  setActivePath,
  setActiveBranch
} from './sagas';
import styles from './styles.scss';

import FileBrowser from 'react-keyed-file-browser'

const mapStateToProps = (state /*, ownProps*/) => {
  const State = state.visualizations.codeHotspots.state;

  return {
    fileURL: State.data.data.fileURL,
    path: State.data.data.path,
    branch: State.data.data.branch,
    files: State.data.data.files};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) =>{
  return {
    onSetFile: url => dispatch(setActiveFile(url)),
    onSetPath: path => dispatch(setActivePath(path)),
    onSetBranch: branch => dispatch(setActiveBranch(branch))
  };
};

const CodeHotspotsConfigComponent = props => {
  return (
    <div>
      <div className={styles.configContainer}> Branch:</div>
      <input className={"input"} type={"text"} defaultValue={"master"} onChange={e => {
        props.onSetBranch(e.target.value)
      }}/>

      <div>
        <FileBrowser
          files={props.files}
          detailRenderer={FileDetails}
          onSelectFile={(data) => {
            props.onSetFile(data.webUrl);
            props.onSetPath(data.key);
          }}
        />
      </div>
    </div>
  );
};

const CodeHotspotsConfig = connect(mapStateToProps, mapDispatchToProps)(CodeHotspotsConfigComponent);

export default CodeHotspotsConfig;

class FileDetails extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
      </div>
    );
  }
}

