'use strict';

import React from 'react';
import {connect} from 'react-redux';
import {setOverlay, setHighlightedIssue, setCommitAttribute} from './sagas';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';
import Calendar from 'react-calendar';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUser} from '@fortawesome/free-solid-svg-icons';
import {faUsers} from '@fortawesome/free-solid-svg-icons';
import {faFile} from '@fortawesome/free-solid-svg-icons';
import {faCheckDouble} from '@fortawesome/free-solid-svg-icons';
import {faCheckCircle} from '@fortawesome/free-solid-svg-icons';


const mapStateToProps = (state /*, ownProps*/) => {
  const corState = state.visualizations.codeOwnershipTransfer.state; //!!!!

  return {
    issues: corState.data.issues,
    overlay: corState.config.overlay,
    highlightedIssue: corState.config.highlightedIssue,
    commitAttribute: corState.config.commitAttribute
  };
};

let divStyle = {
  paddingTop: '20px',
  paddingBottom: '20px'
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetOverlay: overlay => dispatch(setOverlay(overlay)),
    onSetHighlightedIssue: issue => dispatch(setHighlightedIssue(issue)),
    onChangeCommitAttribute: attr => dispatch(setCommitAttribute(attr))
  };
};

const CodeOwnershipTransferConfigComponent = props => {
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
                {label: 'Files', icon: 'file', value: 'files'},
                {label: 'Commits', icon: 'check', value: 'commits'}
              ]}
            />
          </div>
        </div>

        {props.overlay === 'developers' &&
        <div className="field">
          <input placeholder="Search..."/>
          <div style={divStyle}>
            <div className="card">
              <div className="card-content">
                <p>
                  <FontAwesomeIcon icon={faUser}/>&nbsp;&nbsp;Developer:</p>
                <p>
                  <FontAwesomeIcon icon={faFile}/>&nbsp;&nbsp;Owned Files:</p>
                <p>
                  <FontAwesomeIcon icon={faCheckCircle}/>&nbsp;&nbsp;Number of commits:</p>
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

        {props.overlay === 'commits' &&
        <div className="field">
          <div>
            <Calendar
            />
          </div>
          <div style={divStyle}>
            <div className="card">
              <div className="card-content">
                <p><FontAwesomeIcon icon={faCheckDouble}/>&nbsp;&nbsp;Number of Commits:</p>
                <p><FontAwesomeIcon icon={faFile}/>&nbsp;&nbsp;Number of Files:</p>
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
