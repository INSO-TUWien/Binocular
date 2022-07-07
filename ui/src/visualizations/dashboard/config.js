'use strict';

import React from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import visualizationRegistry from './visualizationRegistry';

const mapStateToProps = (state /*, ownProps*/) => {
  return {};
};

const mapDispatchToProps = (dispatch /*, ownProps*/) => {
  return {};
};

const DashboardConfigComponent = (props) => {
  const visulaizations = [];
  for (const visualization in visualizationRegistry) {
    const viz = visualizationRegistry[visualization];
    if (viz.ConfigComponent !== undefined) {
      visulaizations.push(viz);
    }
  }
  return (
    <div className={styles.configContainer}>
      {visulaizations.map((viz) => {
        return (
          <div>
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
