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
  setActivePath,
  setActiveBranch
} from './sagas';
import styles from './styles.scss';
import codeHotspots from "./index";

import FileBrowser from 'react-keyed-file-browser'
import { graphQl } from '../../utils';
import Promise from "bluebird";


const mapStateToProps = (state /*, ownProps*/) => {
  const iiState = state.visualizations.codeHotspots.state;

  return {
    fileURL: iiState.data.data.fileURL,
    path: iiState.data.data.path,
    branch: iiState.data.data.branch,
    files: iiState.data.data.files};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetFile: url => dispatch(setActiveFile(url)),
    onSetPath: path => dispatch(setActivePath(path)),
    onSetBranch: branch => dispatch(setActiveBranch(branch))
  };
};

const CodeHotspotsConfigComponent = props => {

  requestFileStructure().then(function (resp){
    for (let i in resp) {
      props.files.push({key:resp[i].path,webUrl:resp[i].webUrl})
    }
  });


  return (
    <div>
      <div className={styles.configContainer}> Branch:</div>
      <input type={"text"} defaultValue={"master"} onChange={e => {
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

function requestFileStructure(){
  return Promise.resolve(
    graphQl.query(
      `
      query{
       files(sort: "ASC"){
          data{path,webUrl}
        }
      }
      `,
      {}
    ))
    .then(resp => resp.files.data);
}
