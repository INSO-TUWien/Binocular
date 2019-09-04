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

const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeOwnershipTransfer.state; //!!!!

  return {
    category: corState.config.category,
    commit: corState.config.commit,
    overlay: corState.config.overlay,
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

  };
};

const CodeOwnershipTransferConfigComponent = props => {


  let devOptions = [];
  for( let i = 0; i < arrayOfDev.length; i++) {
    d.push(<option value={arrayOfDev[i]} key={arrayOfDev[i]}>{arrayOfDev[i]}</option>);
  }
  console.log('Developers Select Options', devOptions);

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
                  <FontAwesomeIcon icon={faUser}/>&nbsp;&nbsp;Developer:</p>
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
          <input placeholder="Search for file..."/>
          <div style={divStyle}>
            <div className="card">
              <div className="card-content">
                <p><FontAwesomeIcon icon={faFile}/>&nbsp;&nbsp;Chosen File:</p>
                <p><FontAwesomeIcon icon={faUsers}/>&nbsp;&nbsp;Number of Developers:</p>
                <p><FontAwesomeIcon icon={faUser}/>&nbsp;&nbsp;Owner:</p>
                <p><FontAwesomeIcon icon={faCheckCircle}/>&nbsp;&nbsp;Number of Commits:</p>
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
