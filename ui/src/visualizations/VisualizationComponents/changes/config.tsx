'use strict';

import { connect } from 'react-redux';
import { setDisplayMetric, setSelectedAuthors } from './sagas';
import TabCombo from '../../../components/TabCombo';
import styles from './styles.scss';
import { IGlobalState } from '../../../types/globalTypes';
import * as React from 'react';
import { IPalette } from '../../../types/authorTypes';

const mapStateToProps = (state: IGlobalState) => {
  const dashboardState = state.visualizations.changes.state;

  return {
    committers: dashboardState.data.data.committers,
    resolution: dashboardState.config.chartResolution,
    palette: dashboardState.data.data.palette,
    metric: dashboardState.config.displayMetric,
    selectedAuthors: dashboardState.config.selectedAuthors,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onClickMetric: (metric: string) => dispatch(setDisplayMetric(metric)),
    onClickCheckboxLegend: (selected: boolean) => dispatch(setSelectedAuthors(selected)),
  };
};

interface IProps {
  committers: string[];
  metric: string;
  palette: IPalette;
  resolution: string;
  selectedAuthors: string[];
  onClickCheckboxLegend: (selected: boolean) => void;
  onClickMetric: (metric: string) => void;
}

const ChangesConfigComponent = (props: IProps) => {
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
            onChange={(value: string) => props.onClickMetric(value)}
          />
        </div>
      </div>
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(ChangesConfigComponent);

export default DashboardConfig;
