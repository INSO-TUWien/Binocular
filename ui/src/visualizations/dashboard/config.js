'use strict';

import React from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import visualizationRegistry from './visualizationRegistry';
import { setResolution } from './sagas';
import UniversalConfig from './components/universalConfig/universalConfig';

const mapStateToProps = (state /*, ownProps*/) => {
  const dashboardState = state.visualizations.newDashboard.state;
  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {
    onClickResolution: (resolution) => dispatch(setResolution(resolution)),
  };
};

const DashboardConfigComponent = (props) => {
  const visualizations = [];
  for (const visualization in visualizationRegistry) {
    const viz = visualizationRegistry[visualization];
    if (viz.ConfigComponent !== undefined) {
      if (viz.hideSettingsInDashboard === undefined) {
        visualizations.push(viz);
      } else if (!viz.hideSettingsInDashboard) {
        visualizations.push(viz);
      }
    }
  }
  return (
    <div className={styles.configContainer}>
      <UniversalConfig />
      {visualizations.map((viz) => {
        return (
          <div key={viz.id}>
            <hr />
            <h1>{viz.label}</h1>
            <hr />
            {React.createElement(viz.ConfigComponent)}
          </div>
        );
      })}
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(DashboardConfigComponent);

export default DashboardConfig;
