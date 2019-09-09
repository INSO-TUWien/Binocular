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
    onSetFile: file => dispatch(setActiveFile(file)),


  };
};

const CodeOwnershipTransferConfigComponent = props => {


  let devOptions = [];
  let numOfCommitDev = 0;
  let numOfCommitFile = 0;
  let numOfDevFile = 0;
  devOptions.push(<option value="" key="0">Select Developer</option>);
  for( let i = 0; i < arrayOfDev.length; i++) {
    devOptions.push(<option value={arrayOfDev[i].name} key={i+1}>{arrayOfDev[i].name}</option>);
  }
  console.log('Developers Select Options', devOptions);

  for (let i = 0; i < arrayOfDev.length; i++) {
    if(props.category === arrayOfDev[i].name) {
      numOfCommitDev = arrayOfDev[i].numOfCommits;
    }
  }

  for(let i = 0; i < arrayOfFiles.length; i++) {
    if(props.chosenFile.path ===  arrayOfFiles[i].path){
      numOfCommitFile = arrayOfFiles[i].numOfCommits;
      numOfDevFile = arrayOfFiles[i].numOfDev;
    }
  }

  console.log('PROP FILE', props.file);

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
                  <FontAwesomeIcon icon={faUser}/>&nbsp;&nbsp;Developer:  <span>{props.category}</span></p>
                <p><FontAwesomeIcon icon={faCheckCircle}/>&nbsp;&nbsp;Number of Commits:  <span>{numOfCommitDev}</span></p>
                <p>
                  <FontAwesomeIcon icon={faFile}/>&nbsp;&nbsp;Owned Files:</p>
              </div>
            </div>
          </div>
          <div className="control">
            <label className="label">Show visualization by:</label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'count'}
                onChange={() => props.onChangeCommitAttribute('count')}
              />
              Commits
            </label>
            <label className="radio">
              <input
                name="commitAttribute"
                type="radio"
                checked={props.commitAttribute === 'changes'}
                onChange={() => props.onChangeCommitAttribute('changes')}
              />
              Ownership of file
            </label>
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
                <p><FontAwesomeIcon icon={faFile}/>&nbsp;&nbsp;Chosen File: {props.chosenFile.path}</p>
                <p><FontAwesomeIcon icon={faUsers}/>&nbsp;&nbsp;Number of Developers: <span>{numOfDevFile}</span></p>
                <p><FontAwesomeIcon icon={faUser}/>&nbsp;&nbsp;Owner:</p>
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
