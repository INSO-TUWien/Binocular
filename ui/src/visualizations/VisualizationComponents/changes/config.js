'use strict';

import { connect } from 'react-redux';
import { setDisplayMetric, setSelectedAuthors } from './sagas';
import TabCombo from '../../../components/TabCombo/tabCombo';
import styles from './styles.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.changes.state;

  return {
    committers: dashboardState.data.data.committers,
    resolution: dashboardState.config.chartResolution,
    palette: dashboardState.data.data.palette,
    metric: dashboardState.config.displayMetric,
    selectedAuthors: dashboardState.config.selectedAuthors,
  };
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickMetric: (metric) => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: (selected) => dispatch(setSelectedAuthors(selected)),
  };
};

const ChangesConfigComponent = (props) => {
  let otherCommitters;
  if (props.palette && 'others' in props.palette) {
    otherCommitters = props.committers.length - (Object.keys(props.palette).length - 1);
  }

  return (
    <div className={styles.configContainer}>
      <div className={styles.field}>
        <label className="label">Changes</label>
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
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(ChangesConfigComponent);

export default DashboardConfig;
