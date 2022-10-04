'use strict';

import _ from 'lodash';
import { connect } from 'react-redux';

import styles from './styles.scss';
import { setNavigationMode, setTimeSpan, applyTimeSpan } from './sagas';
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
    navigationMode: coChangeState.config.navigationMode,
    commitsFiles: coChangeState.data.data.commitsFiles,
    firstDisplayDate: firstDisplayDate,
    lastDisplayDate: lastDisplayDate
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onNavigationModeChange: (navigationMode) => dispatch(setNavigationMode(navigationMode)),
    onChangeTimeSpan: (timeSpan) => dispatch(setTimeSpan(timeSpan)),
    onTimeSpanApply: () => dispatch(applyTimeSpan())
  };
};

const CoChangeConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
      <div className="field">
          <div className="control">
            <label className="label">Navigation Mode:</label>
            <label className="radio">
              <input
                name="navigationMode"
                type="radio"
                checked={props.navigationMode === 'pan'}
                onChange={() => props.onNavigationModeChange('pan')}
              />
              Pan
            </label>
            <label className="radio">
              <input
                name="navigationMode"
                type="radio"
                checked={props.navigationMode === 'highlight'}
                onChange={() => props.onNavigationModeChange('highlight')}
              />
              Highlight
            </label>
          </div>
          <label className="label">Time span:</label>
          <div>
            <DateRangeFilter
              from={props.firstDisplayDate}
              to={props.lastDisplayDate}
              onDateChanged={(data) => {
                console.log(data);
                props.onChangeTimeSpan(data);
              }}
          />
        </div>
        <button onClick={() => {props.onTimeSpanApply()}}>Apply</button>
        </div>
      </form>
    </div>
  );
};

const CoChangeConfig = connect(mapStateToProps, mapDispatchToProps)(CoChangeConfigComponent);

export default CoChangeConfig;
