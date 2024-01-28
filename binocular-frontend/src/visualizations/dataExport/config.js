'use strict';

import React from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.export.state;
  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

const DashboardConfigComponent = (props) => {
  return <div className={styles.configContainer}></div>;
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(DashboardConfigComponent);

export default DashboardConfig;
