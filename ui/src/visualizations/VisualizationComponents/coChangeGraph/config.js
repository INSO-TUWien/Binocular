'use strict';

import _ from 'lodash';
import { connect } from 'react-redux';

import styles from './styles.scss';
import { setTimeSpan, applyTimeSpan, setEntitySelection, setShowIntraModuleDeps, setNodeHighlighting, setActivateNodeHighlighting, setMinSharedCommits } from './sagas';
import DateRangeFilter from '../../../components/DateRangeFilter/dateRangeFilter';


const mapStateToProps = (state /*, ownProps*/) => {
  const coChangeState = state.visualizations.coChangeGraph.state;
  let firstDisplayDate = '';
  let lastDisplayDate = '';

  if (coChangeState.config.chartTimeSpan.from === undefined) {
    firstDisplayDate =
      coChangeState.data.data.firstCommit !== undefined ? coChangeState.data.data.firstCommit.date.split('.')[0] : undefined;
  } else {
    firstDisplayDate = coChangeState.config.chartTimeSpan.from;
  }

  if (coChangeState.config.chartTimeSpan.to === undefined) {
    lastDisplayDate =
      coChangeState.data.data.lastCommit !== undefined ? coChangeState.data.data.lastCommit.date.split('.')[0] : undefined;
  } else {
    lastDisplayDate = coChangeState.config.chartTimeSpan.to;
  }

  return {
    commitsFiles: coChangeState.data.data.commitsFiles,
    firstDisplayDate: firstDisplayDate,
    lastDisplayDate: lastDisplayDate,
    entitySelection: coChangeState.config.entitySelection,
    showIntraModuleDeps: coChangeState.config.showIntraModuleDeps,
    activateNodeHighlighting: coChangeState.config.activateNodeHighlighting,
    minSharedCommits: coChangeState.config.minSharedCommits
  };
};

let filter = "ui/src/visualizations/";
let lowerBounds = 0.1;
let entitySelection = "files";

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onChangeTimeSpan: (timeSpan) => dispatch(setTimeSpan(timeSpan)),
    onTimeSpanApply: () => dispatch(applyTimeSpan({filter: filter, lowerBounds: lowerBounds, entitySelection: entitySelection})),
    onFilterChange: (filterContent) => {filter = filterContent},
    onBoundraryChange: (boundrary) => {lowerBounds = boundrary},
    onEntitySelectionChange: (entityType) => {entitySelection = entityType; dispatch(setEntitySelection(entityType))},
    onSetShowIntraModuleDeps: (b) => dispatch(setShowIntraModuleDeps(b)),
    onNodeHighlightingChange: (nodeToHighlight) => {dispatch(setNodeHighlighting(nodeToHighlight))},
    onSetActivateNodeHighlighting: (b) => dispatch(setActivateNodeHighlighting(b)),
    onMinSharedCommitsChange: (minSharedCommits) => dispatch(setMinSharedCommits(minSharedCommits)),
  };
};

const CoChangeConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
        <div className="control">
            <label className="label">Show Graph for:</label>
            <label className="radio">
              <input
                name="entitySelection"
                type="radio"
                checked={entitySelection === 'files'}
                onChange={() => props.onEntitySelectionChange('files')}
              />
              Files
            </label>
            <label className="radio">
              <input
                name="entitySelection"
                type="radio"
                checked={entitySelection === 'modules'}
                onChange={() => props.onEntitySelectionChange('modules')}
              />
              Modules
            </label>
        </div>
          <label className="label">Time Span:</label>
          <div>
            <DateRangeFilter
              from={props.firstDisplayDate}
              to={props.lastDisplayDate}
              onDateChanged={(data) => {
                props.onChangeTimeSpan(data);
              }}
          />
        </div>
        <label className="label">Path filter</label>
        <input  type="text" 
                defaultValue="ui/src/visualizations/"
                onChange={(e) => {props.onFilterChange(e.target.value)}}></input>
        <br/>
        <label className="checkbox">
              <input
                type="checkbox"
                id="filterIntraModule"
                checked={props.showIntraModuleDeps}
                onChange={(e) => props.onSetShowIntraModuleDeps(e.target.checked)}
              />
              Show Intra-Module Dependencies
        </label>
        <label className="label">Lower Boundrary for Co-Changes</label>
        <input  type="number" 
                defaultValue={lowerBounds}
                step="0.05"
                min="0"
                max="1"
                onChange={(e) => {props.onBoundraryChange(e.target.value)}}
        ></input>
        <label className="label">Minimum Amount of Shared Commits</label>
        <input  type="number" 
                defaultValue={props.minSharedCommits}
                step="1"
                min="1"
                onChange={(e) => {props.onMinSharedCommitsChange(e.target.value)}}
        ></input>
        <br/>
      <button onClick={() => {props.onTimeSpanApply()}}>Apply</button>
      <br/><br/>
      <label className="label">Highlight Nodes:</label>
        <input  type="text" 
                defaultValue=""
                onChange={(e) => {props.onNodeHighlightingChange(e.target.value)}}></input>
        <label className="checkbox">
          <input
            type="checkbox"
            id="show node highlighting"
            checked={props.activateNodeHighlighting}
            onChange={(e) => props.onSetActivateNodeHighlighting(e.target.checked)}
          />
          Activate Highlighting
        </label>
    </div>
  );
};

const CoChangeConfig = connect(mapStateToProps, mapDispatchToProps)(CoChangeConfigComponent);

export default CoChangeConfig;
