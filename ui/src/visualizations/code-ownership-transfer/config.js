'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {setOverlay, setCommitAttribute, setCategory} from './sagas';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import {faUsers} from '@fortawesome/free-solid-svg-icons';
import {faFile} from '@fortawesome/free-solid-svg-icons';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import {arrayOfDev} from "./sagas/getDevelopers";
import Promise from "bluebird";
import {graphQl} from "../../utils";
import SearchBox from "../../components/SearchBox";
import {setActiveFile} from "./sagas";
import {arrayOfFiles} from "./sagas/getAllFiles";
import {ownershipOfFileList} from "./sagas/getOwner";
import {filesForDev, numOfCommits} from "./sagas/getFilesForDeveloper";
import Select from 'react-select';
import 'react-select/dist/react-select.css';


const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeOwnershipTransfer.state; //!!!!

  return {
    category: corState.config.category,
    commit: corState.config.commit,
    overlay: corState.config.overlay,
    files: corState.data.files,
    chosenFile: corState.config.chosenFile
  };
};

let divStyle = {
  paddingTop: '20px',
  paddingBottom: '20px'
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetOverlay: overlay => dispatch(setOverlay(overlay)),
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr)),
    onSetCategory: cat => dispatch(setCategory(cat)),
    onSetFile: file => dispatch(setActiveFile(file))
  };
};

export var numOfDevFile = 0;
export var developerChosen = '';


function onGetFile(props){
  if(developerChosen) {
    console.log('FIle', filesForDev);

    return <Select className={styles.selectStyle}
                   name="form-field-name"
                   value={props.chosenFile}
                   onChange={file => props.onSetFile(file)}
                   options={filesForDev}
    />
  }
}





const CodeOwnershipTransferConfigComponent = props => {

  let devOptions = [];
  let numOfCommitDev = 0;
  let numOfCommitFile = 0;
  let ownerOfFile = '';
  let fileName = '';

  devOptions.push(<option value="" key="0">Select Developer</option>);
  for( let i = 0; i < arrayOfDev.length; i++) {
    devOptions.push(<option value={arrayOfDev[i].name} key={i+1}>{arrayOfDev[i].name}</option>);
  }

  for (let i = 0; i < arrayOfDev.length; i++) {
    if(props.category === arrayOfDev[i].name) {
      developerChosen = arrayOfDev[i].name;
      numOfCommitDev = arrayOfDev[i].numOfCommits;
    }
  }

  if(props.chosenFile) {
    for(let i = 0; i < arrayOfFiles.length; i++) {
      if(props.chosenFile.path ===  arrayOfFiles[i].path){
        fileName = arrayOfFiles[i].path;
        numOfCommitFile = arrayOfFiles[i].numOfCommits;
        numOfDevFile = arrayOfFiles[i].numOfDev;
      }
    }
  }


  if(fileName !== '') {
    //get owner of file
    if(ownershipOfFileList.length > 0) {
      let lastFileStatus = ownershipOfFileList[ownershipOfFileList.length - 1];
      if (!lastFileStatus.length) {
        ownerOfFile = 'This file is deleted';
        console.log('FILE OWNER', ownerOfFile);
      } else {
      //Count how many lines after last commit is owned by which developer
      let counts = {};
      lastFileStatus.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });
      let val = 0;
      let dev = '';
      for (let k in counts) {
        console.log('Developer', k, 'ownes', counts[k]);
        if (val < counts[k]) {
          val = counts[k];
          dev = k;
        }
      }
      ownerOfFile = dev;
    }
    }
  }

  return (
    <div className={styles.configContainer}>
      <form>
        <div className="field">
          <div className="control">
            <TabCombo
              value={props.overlay}
              onChange={value => props.onSetOverlay(value)}
              options={[
                {label: 'Developers', icon: 'users', value: 'developers'},
                {label: 'Files', icon: 'file', value: 'files'}
              ]}
            />
          </div>
        </div>

        {props.overlay === 'developers' &&
        <div className="field">
          <div className="control">
            <div className="select">
              <select
                value={props.category}
                onChange={evt => props.onSetCategory(evt.target.value)}>
                {devOptions}
              </select>
            </div>
          </div>
          <div style={divStyle}>
            <div className="card">
              <div className="card-content">
                <p>
                  <FontAwesomeIcon icon={faUser}/>&nbsp;&nbsp;Developer: <span> {props.category}</span></p>
                <p><FontAwesomeIcon icon={faCheckCircle}/>&nbsp;&nbsp;Number of Commits:  <span>{numOfCommits}</span></p>
              </div>
            </div>
          </div>
          <div className="field">
            {onGetFile(props)}
          </div>
        </div>}


        {props.overlay === 'files' &&
        <div className="field">
          <SearchBox
            placeholder="Select file..."
            renderOption={i => `${i.path}`}
            search={text => {
              return Promise.resolve(
                graphQl.query(
                  `
                  query($q: String) {
                    files(page: 1, perPage: 50, q: $q, sort: "DESC") {
                      data { path }
                    }
                  }`,
                  { q: text }
                )
              )
                .then(resp => resp.files.data)
            }}
            value={props.chosenFile}
            onChange={file => props.onSetFile(file)}
          />
          <div style={divStyle}>
            <div className="card">
              <div className="card-content">
                <p><FontAwesomeIcon icon={faFile}/>&nbsp;&nbsp;Chosen File: <span>{fileName}</span></p>
                <p><FontAwesomeIcon icon={faUsers}/>&nbsp;&nbsp;Number of Developers: <span>{numOfDevFile}</span></p>
                <p><FontAwesomeIcon icon={faUser}/>&nbsp;&nbsp;Owner: <span>{ownerOfFile}</span></p>
                <p><FontAwesomeIcon icon={faCheckCircle}/>&nbsp;&nbsp;Number of Commits: <span>{numOfCommitFile}</span></p>
              </div>
            </div>
          </div>
        </div>}
      </form>
    </div>
  );
};

const CodeOwnershipTransferConfig = connect(mapStateToProps, mapDispatchToProps)(
  CodeOwnershipTransferConfigComponent
);

export default CodeOwnershipTransferConfig;
