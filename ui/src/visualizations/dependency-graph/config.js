'use strict';

import Promise from 'bluebird';
import { connect } from 'react-redux';
import { reloadData, setDepth, setMeanPercentageOfCombinedCommitsThreshold, setMeanPercentageOfMaxCommitsThreshold, setFiles } from './sagas';
import SearchBox from '../../components/SearchBox';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';
import SuperTreeview from 'react-super-treeview';
import React from 'react';
import ReactDOM from 'react-dom';
import Nouislider from 'react-nouislider';
import "nouislider/distribute/nouislider.css";
import moment from 'moment';

var range = <Nouislider
                range={{min: 0, max: 1}}
                start={[0, 100]}
                tooltips
              />

const mapStateToProps = (state /*, ownProps*/) => {
  const dgState = state.visualizations.dependencyGraph.state;
  
  var fileTree = dgState.config.fileTree;

  if(!!dgState.data.data.filesAndLinks && dgState.config.reloaded) {
    fileTree = [dgState.data.data.filesAndLinks.fileTree];
  }

  var fromTimestamp = dgState.config.fromTimestamp;
  var toTimestamp = dgState.config.toTimestamp;
  var firstCommitTimestamp = 0;
  var lastCommitTimestamp = 1;

  if(!!dgState.data.data.firstCommitTimestamp && !!dgState.data.data.lastCommitTimestamp) {
    firstCommitTimestamp = dgState.data.data.firstCommitTimestamp;
    lastCommitTimestamp = dgState.data.data.lastCommitTimestamp;
  }

  if(!!dgState.data.data.firstCommitTimestamp && !!dgState.data.data.lastCommitTimestamp 
    && dgState.config.fromTimestamp == 0 && dgState.config.toTimestamp == 0) {
    fromTimestamp = dgState.data.data.firstCommitTimestamp;
    toTimestamp = dgState.data.data.lastCommitTimestamp;
  }

  range = <Nouislider
                range={{min: firstCommitTimestamp, max: lastCommitTimestamp}}
                start={[fromTimestamp, toTimestamp]}
                tooltips={[{to: function(value) {
                  return moment.unix(Math.round(parseInt(value)/1000)).format("DD.MM.YYYY");
                }}, {to: function(value) {
                  return moment.unix(Math.round(parseInt(value)/1000)).format("DD.MM.YYYY");
                }}]}
                step={86400}
                onSlide={data => {
                  dgState.config.fromTimestamp = data[0];
                  dgState.config.toTimestamp = data[1];
                }}
              />

  return {
    depth: dgState.config.depth,
    meanPercentageOfCombinedCommitsThreshold: dgState.config.meanPercentageOfCombinedCommitsThreshold,
    meanPercentageOfMaxCommitsThreshold: dgState.config.meanPercentageOfMaxCommitsThreshold,
    fileTree: fileTree,
    fromTimestamp: fromTimestamp,
    toTimestamp: toTimestamp
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onSetDepth: depth => dispatch(setDepth(depth)),
    onSetMeanPercentageOfCombinedCommitsThreshold: meanPercentageOfCombinedCommitsThreshold => dispatch(setMeanPercentageOfCombinedCommitsThreshold(meanPercentageOfCombinedCommitsThreshold)),
    onSetMeanPercentageOfMaxCommitsThreshold: meanPercentageOfMaxCommitsThreshold => dispatch(setMeanPercentageOfMaxCommitsThreshold(meanPercentageOfMaxCommitsThreshold)),
    onSetFiles: fileTree => dispatch(setFiles(fileTree)),
    onReloadData: reloadFiletree => dispatch(reloadData(reloadFiletree))
  };
};

const DependencyGraphConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form className={styles.form}>
        <div className={styles.field}>
        <label className="label">Depth:</label>
          <div className="control">
            <div className="select">
              <select
                value={props.depth}
                onChange={evt => props.onSetDepth(evt.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.field}>
        <label className="label">Mean percentage of combined commits threshold:</label>
          <div className="control">
            <div className="input">
              <input type="number" value={props.meanPercentageOfCombinedCommitsThreshold} onChange={evt => props.onSetMeanPercentageOfCombinedCommitsThreshold(evt.target.value)}/>
            </div>
          </div>
        </div>
        <div className={styles.field}>
        <label className="label">Mean percentage of max commits threshold:</label>
          <div className="control">
            <div className="input">
              <input type="number" value={props.meanPercentageOfMaxCommitsThreshold} onChange={evt => props.onSetMeanPercentageOfMaxCommitsThreshold(evt.target.value)}/>
            </div>
          </div>
        </div>
        <label className="label">Time range:</label>
        <br></br>
        <br></br>
        <div style={{width: "90%", marginLeft: "5%"}}>
          {range} 
        </div>
        <br/>
        <button type="button" onClick={evt => props.onReloadData(true)}>Set Time Range</button>
        <label className="label">Files:</label>
        <button type="button" onClick={evt => props.onReloadData(false)}>Set Files</button>
        <SuperTreeview
          data={ props.fileTree }
          onUpdateCb={(updatedData)=>{
            props.onSetFiles(updatedData);
          }}
          onCheckToggleCb={(updatedNode)=>{
            setChildrenRecursive(updatedNode, null);
          }}
          isCheckable={(node, depth)=>{
            return true;
          }}
          isExpandable={(node, depth) => { return false; }}
          isDeletable={(node, depth) => { return false; }}
          noChildrenAvailableMessage=""
        />
      </form>
    </div>
  );
};

function setChildrenRecursive(children, parent) {
  for(var i = 0; i < children.length; i++) {
    if(!!parent) {
      children[i].isChecked = parent.isChecked;
    }

    if(!!children[i].children && children[i].children.length > 0) {
      children[i].children = setChildrenRecursive(children[i].children, children[i]);
    }
  }

  return children;
}

const DependencyGraphConfig = connect(mapStateToProps, mapDispatchToProps)(
  DependencyGraphConfigComponent
);

export default DependencyGraphConfig;
