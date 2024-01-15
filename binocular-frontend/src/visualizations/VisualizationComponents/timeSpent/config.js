'use strict';

import { connect } from 'react-redux';

import styles from './styles.module.scss';
import React from 'react';
import { setAggregateTime } from './sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const timeSpentState = state.visualizations.timeSpent.state;

  return { aggregatedTime: timeSpentState.config.aggregatedTime };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return { onSetAggregateTime: (value) => dispatch(setAggregateTime(value)) };
};

const TimeSpentConfigComponent = (props) => {
  return (
    <div className={styles.configContainer}>
      <div className="field">
        <input
          id="aggregateTimeSwitch"
          type="checkbox"
          name="aggregateTimeSwitch"
          className={'switch is-rounded is-outlined is-info'}
          defaultChecked={props.aggregateTime}
          onChange={(e) => props.onSetAggregateTime(e.target.checked)}
        />
        <label htmlFor="aggregateTimeSwitch" className={styles.switch}>
          Aggregate Time Spent
        </label>
      </div>
    </div>
  );
};

const TimeSpentConfig = connect(mapStateToProps, mapDispatchToProps)(TimeSpentConfigComponent);

export default TimeSpentConfig;
