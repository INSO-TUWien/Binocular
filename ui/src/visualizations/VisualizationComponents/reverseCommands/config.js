'use strict';

import { connect } from 'react-redux';
import { setDisplayMetric, setSelectedAuthors, setSelectedBranches } from './sagas';
import TabCombo from '../../../components/TabCombo.js';
import styles from './styles.scss';
import { setActiveBranches, setActiveBranch } from './sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.reverseCommands.state;

  return {
    committers: dashboardState.data.data.committers,
    resolution: dashboardState.config.chartResolution,
    metric: dashboardState.config.displayMetric,
    selectedAuthors: dashboardState.config.selectedAuthors,
    branches: dashboardState.data.data.branches,
    selectedBranches: dashboardState.config.selectedBranches,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickMetric: (metric) => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: (selected) => dispatch(setSelectedAuthors(selected)),
    onSetBranches: (branches) => dispatch(setActiveBranches(branches)),
    onSetBranch: (branch) => dispatch(setActiveBranch(branch)),
    onSetSelectedBranches: (branches) => dispatch(setSelectedBranches(branches)),
  };
};

const ReverseCommandsConfigComponent = (props) => {
  const options = [];
  for (const i in props.branches) {
    //console.log('branch', props.branches[i].branch);
    options.push(<option key={i}>{props.branches[i].branch}</option>);
  }
  return (
    <div className={styles.configContainer}>
      <div className={styles.configContainer}>
        <div className={styles.label}> Branch: </div>
        <div id={'branchSelector'} className={'select ' + styles.branchSelect}>
          <select
            className={styles.branchSelect}
            multiple
            value={props.branch}
            onChange={(e) => {
              props.onSetBranch(e.target.value);
              console.log('value change', e.target.selectedOptions);
              const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
              console.log('selected opts:', selectedOptions);
              props.onSetSelectedBranches(selectedOptions);
            }}>
            {options}
          </select>
        </div>
      </div>
      <form className={styles.form}>
        <div className={styles.field}>
          <label className="label"></label>
        </div>
      </form>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(ReverseCommandsConfigComponent);

export default DashboardConfig;
