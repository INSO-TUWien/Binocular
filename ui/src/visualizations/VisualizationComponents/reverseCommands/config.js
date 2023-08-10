'use strict';

import { connect } from 'react-redux';
import { setDisplayMetric, setSelectedAuthors } from './sagas';
import TabCombo from '../../../components/TabCombo.js';
import styles from './styles.scss';
import { setActiveBranch } from '../../legacy/code-hotspots/sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.reverseCommands.state;

  return {
    committers: dashboardState.data.data.committers,
    resolution: dashboardState.config.chartResolution,
    palette: dashboardState.data.data.palette,
    metric: dashboardState.config.displayMetric,
    selectedAuthors: dashboardState.config.selectedAuthors,
    branches: dashboardState.data.data.branches,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickMetric: (metric) => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: (selected) => dispatch(setSelectedAuthors(selected)),
  };
};

const ReverseCommandsConfigComponent = (props) => {
  let otherCommitters;
  if (props.palette && 'others' in props.palette) {
    otherCommitters = props.committers.length - (Object.keys(props.palette).length - 1);
  }

  const options = [];
  for (const i in props.branches) {
    options.push(<option key={i}>{props.branches[i].branch}</option>);
  }
  return (
    <div className={styles.configContainer}>
      <div className={styles.configContainer}>
        <div className={styles.label}> Branch: </div>
        <div id={'branchSelector'} className={'select ' + styles.branchSelect}>
          <select
            className={styles.branchSelect}
            value={props.branch}
            onChange={(e) => {
              props.onSetBranch(e.target.value);
            }}>
            {options}
          </select>
        </div>
      </div>
      <form className={styles.form}>
        <div className={styles.field}>
          <label className="label">Reverse Commands</label>
          <div style={{ marginBottom: '0.5em' }}>
            <TabCombo
              value={props.metric}
              options={[
                { label: '# lines changed', icon: 'file-alt', value: 'linesChanged' },
                { label: '# commits', icon: 'cloud-upload-alt', value: 'commits' },
              ]}
              onChange={(value) => props.onClickMetric(value)}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(ReverseCommandsConfigComponent);

export default DashboardConfig;
