'use strict';

import React from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import { setResolution, setTimeSpan } from '../sagas';
import DateRangeFilter from '../../../components/DateRangeFilter/dateRangeFilter';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.newDashboard.state;
  return {
    resolution: dashboardState.config.chartResolution,
    firstCommit: dashboardState.data.data.firstCommit,
    lastCommit: dashboardState.data.data.lastCommit,
    firstIssue: dashboardState.data.data.firstIssue,
    lastIssue: dashboardState.data.data.lastIssue,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: (resolution) => dispatch(setResolution(resolution)),
    onChangeTimeSpan: (timeSpan) => dispatch(setTimeSpan(timeSpan)),
  };
};

const UniversalConfigComponent = (props) => {
  return (
    <div>
      <h1 className={styles.headline}>Universal Settings</h1>
      <label className="label">Granularity</label>
      <div className="control">
        <div className="select">
          <select value={props.resolution} onChange={(e) => props.onClickResolution(e.target.value)}>
            <option value="years">Year</option>
            <option value="months">Month</option>
            <option value="weeks">Week</option>
            <option value="days">Day</option>
          </select>
        </div>
      </div>
      <label className="label">Date Range</label>
      <div>
        <DateRangeFilter
          from={props.firstCommit !== undefined ? props.firstCommit.date.split('.')[0] : undefined}
          to={props.lastCommit !== undefined ? props.lastCommit.date.split('.')[0] : undefined}
          onDateChanged={(data) => {
            props.onChangeTimeSpan(data);
          }}
        />
      </div>
    </div>
  );
};

const UniversalConfig = connect(mapStateToProps, mapDispatchToProps)(UniversalConfigComponent);

export default UniversalConfig;
