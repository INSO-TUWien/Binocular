'use strict';

import _ from 'lodash';
import {
  connect
} from 'react-redux';
import {
  inflect
} from 'inflection';

import {
  setActiveFile,
  setActiveBranch
} from './sagas';
import styles from './styles.scss';
import codeHotspots from "./index";


const mapStateToProps = (state /*, ownProps*/) => {
  const iiState = state.visualizations.codeHotspots.state;

  return {
    fileURL: iiState.data.data.fileURL,
    branch: iiState.data.data.branch};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetFile: url => dispatch(setActiveFile(url)),
    onSetBranch: branch => dispatch(setActiveBranch(branch))
  };
};

const CodeHotspotsConfigComponent = props => {
  return (
    <div>
      <div className = {styles.configContainer} > Branch: </div>
      <input type={"text"} defaultValue={"master"} onChange={e=>{props.onSetBranch(e.target.value)}}/>

      <div className = {styles.configContainer} > File: </div>
      <input type={"text"} defaultValue={"/pupil.js"} onChange={e=>{props.onSetFile(e.target.value)}}/>
    </div>
  );
};

const CodeHotspotsConfig = connect(mapStateToProps, mapDispatchToProps)(CodeHotspotsConfigComponent);

export default CodeHotspotsConfig;
