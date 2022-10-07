'use strict';

import _ from 'lodash';
import { connect } from 'react-redux';

import styles from './styles.scss';
import { setTimeSpan, applyTimeSpan, setFilterContent } from './sagas';
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
    pathFilter: coChangeState.config.pathFilter
  };
};

let filter = undefined;

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onChangeTimeSpan: (timeSpan) => dispatch(setTimeSpan(timeSpan)),
    onTimeSpanApply: () => dispatch(applyTimeSpan(filter)),
    onFilterChange: (filterContent) => {filter = filterContent}
  };
};

const CoChangeConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form>
          <label className="label">Time span:</label>
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
        <input type="text" onChange={(e) => {props.onFilterChange(e.target.value)}}></input>
      </form>
      <button onClick={() => {props.onTimeSpanApply(filter)}}>Apply</button>
    </div>
  );
};

const CoChangeConfig = connect(mapStateToProps, mapDispatchToProps)(CoChangeConfigComponent);

export default CoChangeConfig;
