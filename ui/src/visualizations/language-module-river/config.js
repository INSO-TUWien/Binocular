'use strict';

import { connect } from 'react-redux';
import { setResolution, setShowIssues, setSelectedAuthors, setShowCIChart, setShowIssueChart } from './sagas';
import TabCombo from '../../components/TabCombo.js';
import styles from './styles.scss';

import LegendCompact from '../../components/LegendCompact';
import CheckboxLegend from '../../components/CheckboxLegend';

// eslint-disable-next-line no-unused-vars
const mapStateToProps = (state, ownProps) => {
  const languageModuleRiverState = state.visualizations.languageModuleRiver.state;

  return {
    committers: languageModuleRiverState.data.data.committers,
    resolution: languageModuleRiverState.config.chartResolution,
    showIssues: languageModuleRiverState.config.showIssues,
    palette: languageModuleRiverState.data.data.palette,
    selectedAuthors: languageModuleRiverState.config.selectedAuthors,
    showCIChart: languageModuleRiverState.config.showCIChart,
    showIssueChart: languageModuleRiverState.config.showIssueChart
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return Object.assign(
    {
      onClickResolution: resolution => dispatch(setResolution(resolution)),
      onClickIssues: showIssues => dispatch(setShowIssues(showIssues)),
      onClickCheckboxLegend: selected => dispatch(setSelectedAuthors(selected)),
      onClickShowCIChart: showCIChart => dispatch(setShowCIChart(showCIChart)),
      onClickShowIssueChart: showIssueChart => dispatch(setShowIssueChart(showIssueChart))
    },
    ownProps
  );
};

const LangModRiverConfigComponent = props => {
  let otherCommitters;
  if (props.palette && 'others' in props.palette) {
    otherCommitters = props.committers.length - (Object.keys(props.palette).length - 1);
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
                { label: 'Weeks', icon: 'calendar-week', value: 'weeks' },
                { label: 'Days', icon: 'calendar-day', value: 'days' }
              ]}
              onChange={value => props.onClickResolution(value)}
            />
            <div>
              <label className={styles.checkboxLabel}>
                <input
                  name="showCI"
                  type="checkbox"
                  onChange={() => props.onClickShowCIChart(!props.showCIChart)}
                  checked={props.showCIChart}
                />{' '}
                Show CI{' '}
              </label>
            </div>
            <div>
              <label className={styles.checkboxLabel}>
                <input
                  name="showIssues"
                  type="checkbox"
                  onChange={() => props.onClickShowIssueChart(!props.showIssueChart)}
                  checked={props.showIssueChart}
                />{' '}
                Show Issues{' '}
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
          <label className="label">Changes</label>
          <CheckboxLegend
            palette={props.palette}
            onClick={props.onClickCheckboxLegend.bind(this)}
            title="Authors:"
            split={true}
            otherCommitters={otherCommitters}
          />
        </div>
      </form>
    </div>
  );
};

const LangModRiverConfig = connect(mapStateToProps, mapDispatchToProps)(LangModRiverConfigComponent);

export default LangModRiverConfig;
