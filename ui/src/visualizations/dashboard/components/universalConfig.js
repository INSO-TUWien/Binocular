'use strict';

import React from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import { setResolution } from '../sagas';
import TabCombo from '../../../components/TabCombo';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.newDashboard.state;
  return {
    resolution: dashboardState.config.chartResolution,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: (resolution) => dispatch(setResolution(resolution)),
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
    </div>
  );
};

const UniversalConfig = connect(mapStateToProps, mapDispatchToProps)(UniversalConfigComponent);

export default UniversalConfig;
