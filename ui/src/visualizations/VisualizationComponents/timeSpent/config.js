'use strict';

import { connect } from 'react-redux';

import styles from './styles.scss';

import LegendCompact from '../../../components/LegendCompact';
import TabCombo from '../../../components/TabCombo';
import { setShowIssues } from './sagas';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.timeSpent.state;

  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

const TimeSpentConfigComponent = (props) => {
  return <div className={styles.configContainer}></div>;
};

const TimeSpentConfig = connect(mapStateToProps, mapDispatchToProps)(TimeSpentConfigComponent);

export default TimeSpentConfig;
