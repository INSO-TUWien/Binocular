'use strict';

import {connect} from 'react-redux';
import {setResolution, setShowDevs, setShowIssues, setDisplayMetric, setSelectedAuthors} from './sagas';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import LegendCompact from '../../components/LegendCompact';
import CheckboxLegend from '../../components/CheckboxLegend';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.dashboard.state;

  return {
    resolution: dashboardState.config.chartResolution,
    showDevs: dashboardState.config.showDevsInCI,
    showIssues: dashboardState.config.showIssues,
    palette: dashboardState.data.data.palette,
    metric: dashboardState.config.displayMetric,
    selectedAuthors: dashboardState.config.selectedAuthors
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: resolution => dispatch(setResolution(resolution)),
    onClickShowDevs: showDevs => dispatch(setShowDevs(showDevs)),   //TODO remove this if the feature is dropped
    onClickIssues: showIssues => dispatch(setShowIssues(showIssues)),
    onClickMetric: metric => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: selected => dispatch(setSelectedAuthors(selected))
  };
};

const DashboardConfigComponent = props => {
  return (
    <div className={styles.configContainer}>
      <form className={styles.form}>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Time Bucket Size:</label>
            <TabCombo
              value={props.resolution}
              options={[
                {label: 'Years', icon: 'calendar-plus', value: 'years'},
                {label: 'Months', icon: 'calendar', value: 'months'},
                {label: 'Weeks', icon: 'calendar-week', value: 'weeks'},
                {label: 'Days', icon: 'calendar-day', value: 'days'}
              ]}
              onChange={value => props.onClickResolution(value)}
            />
            <p className={styles.checkboxLabel}><input name="showCI" type="checkbox"/> Show CI Graph </p>
            <p className={styles.checkboxLabel}><input name="showIssues" type="checkbox"/> Show Issues Graph </p>
            <p className={styles.checkboxLabel}><input name="showChanges" type="checkbox"/> Show Changes Graph </p>
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">CI Builds</label>
            <LegendCompact text="Succeeded" color="#26ca3b"/>
            <LegendCompact text="Failed" color="#e23b41"/>
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Issues</label>
            <LegendCompact text="Opened" color="#3461eb"/>
            <LegendCompact text="Closed" color="#8099e8"/>
            <TabCombo
              value={props.showIssues}
              options={[
                {label: 'All', icon: 'database', value: 'all'},
                {label: 'Open', icon: 'folder-open', value: 'open'},
                {label: 'Closed', icon: 'folder', value: 'closed'}
              ]}
              onChange={value => props.onClickIssues(value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label className="label">Changes</label>
          <div style={{marginBottom: '0.5em'}}>
            <TabCombo
              value={props.metric}
              options={[
                {label: '# lines changed', icon: 'file-alt', value: 'linesChanged'},
                {label: '# commits', icon: 'cloud-upload-alt', value: 'commits'}
              ]}
              onChange={value => props.onClickMetric(value)}
            />
          </div>
          <CheckboxLegend palette={props.palette} onClick={props.onClickCheckboxLegend.bind(this)} title="Authors:"/>
        </div>
      </form>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(
  DashboardConfigComponent
);

export default DashboardConfig;
