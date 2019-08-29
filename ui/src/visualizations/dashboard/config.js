'use strict';

import { connect } from 'react-redux';
import {setResolution, setShowDevs, setShowIssues, setDisplayMetric} from './sagas';
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
    availableDevs: dashboardState.data.data.committers,
    selectedDevs: dashboardState.config.selectedAuthors,
    devColors: dashboardState.data.data.palette,
    metric: dashboardState.config.displayMetric
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: resolution => dispatch(setResolution(resolution)),
    onClickShowDevs: showDevs => dispatch(setShowDevs(showDevs)),
    onClickIssues: showIssues => dispatch(setShowIssues(showIssues)),
    //TODO incorporate selected devs in CheckBoxLegend
    onClickMetric: metric => dispatch(setDisplayMetric(metric))
  };
};

function assembleColors(devs, palette) {
  let ret = [];
  _.each(devs, function(elem){
    ret.push({name: elem, color: palette[elem]});
  });
  return ret;
}

const DashboardConfigComponent = props => {
  var colorsArray = [];
  if(props.availableDevs) {
    colorsArray = assembleColors(props.availableDevs, props.devColors); //[{name: "dev1 <dev1@email.com>", color: "#ffffff"}, ...] (See function assembleColors)
  }
  //TODO compute or get colors
  return (
    <div className={styles.configContainer}>
      <form>
        <div className={styles.field}>
          <div className="control">
            <label className="label">General Settings</label>
            <p className="field">Chart resolution:</p>
            <TabCombo
              value={'years'}
              options={[
                {label: 'Years', icon: '', value: 'years'},
                {label: 'Months', icon: '', value: 'months'},
                {label: 'Weeks', icon: '', value: 'weeks'},
                {label: 'Days', icon: '', value: 'days'}
              ]}
              onChange={value => props.onClickResolution(value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">CI Builds</label>
            <LegendCompact text="failed" color="#db303a"/>
            <LegendCompact text="succeeded" color="#50ff5a"/>
            <label className={styles.checkboxLabel}><input name="showDevsInCI" type="checkbox"/> Show developers in CI Builds</label>
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Issues</label>
            <LegendCompact text="opened" color="#3461eb"/>
            <LegendCompact text="closed" color="#8099e8"/>
            <label className="label">Show issues:</label>
            <TabCombo
              value={'all'}
              options={[
                {label: 'All', icon: '', value: 'all'},
                {label: 'Open', icon: '', value: 'open'},
                {label: 'Closed', icon: '', value: 'closed'}
              ]}
              onChange={value => props.onClickIssues(value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <div className="control">
            <label className="label">Changes</label>
            <CheckboxLegend content={colorsArray}/>
            <label className="label">Change Measurement:</label>
            <TabCombo
              value={'linesChanged'}
              options={[
                {label: '# lines changed', icon: '', value: 'linesChanged'},
                {label: '# commits', icon: '', value: 'commits'}
              ]}
              onChange={value => props.onClickMetric(value)}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(
  DashboardConfigComponent
);

export default DashboardConfig;
