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
  const configComponents = [];
  for (const visualization in visualizationRegistry) {
    const configComponent = visualizationRegistry[visualization].ConfigComponent;
    if (configComponent !== undefined) {
      configComponents.push(configComponent);
    }
  }
  return (
    <div className={styles.configContainer}>
      {configComponents.map((component) => {
        return (
          <div>
            {React.createElement(component)}
            <hr />
          </div>
        );
      })}
    </div>
  );
};

const DashboardConfig = connect(mapStateToProps, mapDispatchToProps)(DashboardConfigComponent);

export default DashboardConfig;
