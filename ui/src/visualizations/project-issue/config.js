'use strict';

import { connect } from 'react-redux';
import {
  setResolution,
  setShowIssues,
  setDisplayMetric,
  setSelectedIssues,
  setShowNormalizedChart,
  setShowStandardChart,
  setShowMilestoneChart
} from './sagas';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import LegendCompact from '../../components/LegendCompact';
import CheckboxLegend from '../../components/CheckboxLegend';

const mapStateToProps = (state /*, ownProps*/) => {
  const projectIssueState = state.visualizations.projectIssue.state;

  return {
    issues: projectIssueState.data.data.issues,
    resolution: projectIssueState.config.chartResolution,
    showIssues: projectIssueState.config.showIssues,
    palette: projectIssueState.data.data.palette,
    metric: projectIssueState.config.displayMetric,
    selectedIssues: projectIssueState.config.selectedIssues,
    showNormalizedChart: projectIssueState.config.showNormalizedChart,
    showStandardChart: projectIssueState.config.showStandardChart,
    showMilestoneChart: projectIssueState.config.showMilestoneChart
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: resolution => dispatch(setResolution(resolution)),
    onClickIssues: showIssues => dispatch(setShowIssues(showIssues)),
    onClickMetric: metric => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: selected => dispatch(setSelectedIssues(selected)),
    onClickShowNormalizedChart: showNormalizedChart => dispatch(setShowNormalizedChart(showNormalizedChart)),
    onClickShowStandardChart: showStandardChart => dispatch(setShowStandardChart(showStandardChart)),
    onClickShowMilestoneChart: showMilestoneChart => dispatch(setShowMilestoneChart(showMilestoneChart))
  };
};

const ProjectIssueConfigComponent = props => {
  let otherIssues;
  if (props.palette && 'others' in props.palette) {
    otherIssues = props.issues.length - (Object.keys(props.palette).length - 1);
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
                { label: 'Years', icon: 'calendar-plus', value: 'years' },
                { label: 'Months', icon: 'calendar', value: 'months' },
                { label: 'Weeks', icon: 'calendar-week', value: 'weeks' }
              ]}
              onChange={value => props.onClickResolution(value)}
            />
            <div>
              <label className={styles.checkboxLabel}>
                <input
                  name="showStandardChart"
                  type="checkbox"
                  onChange={() => props.onClickShowStandardChart(!props.showStandardChart)}
                  checked={props.showStandardChart}
                />{' '}
                Show standard Chart{' '}
              </label>
            </div>
            <div>
              <label className={styles.checkboxLabel}>
                <input
                  name="showNormalizedChart"
                  type="checkbox"
                  onChange={() => props.onClickShowNormalizedChart(!props.showNormalizedChart)}
                  checked={props.showNormalizedChart}
                />{' '}
                Show normalized Chart{' '}
              </label>
            </div>
            <div>
              <label className={styles.checkboxLabel}>
                <input
                  name="showMilestoneChart"
                  type="checkbox"
                  onChange={() => props.onClickShowMilestoneChart(!props.showMilestoneChart)}
                  checked={props.showMilestoneChart}
                />{' '}
                Show milestone Chart{' '}
              </label>
            </div>
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Issues</label>
            <LegendCompact text="Opened | Closed" color="#3461eb" color2="#8099e8" />
            <TabCombo
              value={props.showIssues}
              options={[
                { label: 'All', icon: 'database', value: 'all' },
                { label: 'Open', icon: 'folder-open', value: 'open' },
                { label: 'Closed', icon: 'folder', value: 'closed' }
              ]}
              onChange={value => props.onClickIssues(value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <CheckboxLegend
            palette={props.palette}
            onClick={props.onClickCheckboxLegend.bind(this)}
            title={'Issues:'}
            explanation={'Title of issue'}
            split={false}
            otherCommitters={otherIssues}
            initialized={true}
            checkboxSelectAll={false}
            numberSelected={3}
          />
        </div>
      </form>
    </div>
  );
};

const ProjectIssueConfig = connect(mapStateToProps, mapDispatchToProps)(ProjectIssueConfigComponent);

export default ProjectIssueConfig;
