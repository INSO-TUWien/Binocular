'use strict';

import {connect} from 'react-redux';
import {setResolution, setShowIssues, setDisplayMetric, setSelectedAuthors, setShowCIChart, setShowIssueChart, setShowChangesChart} from './sagas';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import LegendCompact from '../../components/LegendCompact';
import CheckboxLegend from '../../components/CheckboxLegend';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.dashboard.state;

  return {
    committers: dashboardState.data.data.committers,
    resolution: dashboardState.config.chartResolution,
    showIssues: dashboardState.config.showIssues,
    palette: dashboardState.data.data.palette,
    metric: dashboardState.config.displayMetric,
    selectedAuthors: dashboardState.config.selectedAuthors,
    showCIChart: dashboardState.config.showCIChart,
    showIssueChart: dashboardState.config.showIssueChart,
    showChangesChart: dashboardState.config.showChangesChart
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: resolution => dispatch(setResolution(resolution)),
    onClickIssues: showIssues => dispatch(setShowIssues(showIssues)),
    onClickMetric: metric => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: selected => dispatch(setSelectedAuthors(selected)),
    onClickShowCIChart: showCIChart => dispatch(setShowCIChart(showCIChart)),
    onClickShowIssueChart: showIssueChart => dispatch(setShowIssueChart(showIssueChart)),
    onClickShowChangesChart: showChangesChart => dispatch(setShowChangesChart(showChangesChart))
  };
};

const DashboardConfigComponent = props => {
  let otherCommitters;
  if(props.palette && ('others' in props.palette)){
    otherCommitters = props.committers.length - (Object.keys(props.palette).length-1);
  }


  return (
    <div className={styles.configContainer}>
      <form className={styles.form}>
        <div className={styles.field}>
          <div className="control">
            <label className="label">General Chart Settings</label>
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
            <div><label className={styles.checkboxLabel}><input name="showCI" type="checkbox"
                                                       onChange={() => props.onClickShowCIChart(!props.showCIChart)}
                                                       checked={props.showCIChart}/> Show CI Chart </label></div>
            <div><label className={styles.checkboxLabel}><input name="showIssues" type="checkbox"
                                                       onChange={() => props.onClickShowIssueChart(!props.showIssueChart)}
                                                       checked={props.showIssueChart}/> Show Issues Chart </label></div>
            <div><label className={styles.checkboxLabel}><input name="showChanges" type="checkbox"
                                                       onChange={() => props.onClickShowChangesChart(!props.showChangesChart)}
                                                       checked={props.showChangesChart}/> Show Changes Chart </label></div>
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">CI Builds</label>
            <LegendCompact text="Succeeded | Failed" color="#26ca3b" color2="#e23b41"/>
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Issues</label>
            <LegendCompact text="Opened | Closed" color="#3461eb" color2="#8099e8"/>
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
          <CheckboxLegend palette={props.palette}
                          onClick={props.onClickCheckboxLegend.bind(this)}
                          title="Authors:"
                          split={props.metric === "linesChanged"}
                          otherCommitters={otherCommitters}/>
        </div>
      </form>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(
  DashboardConfigComponent
);

export default DashboardConfig;
