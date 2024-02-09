'use strict';

import React from 'react';
import { useSelector } from 'react-redux';
import styles from './styles.module.scss';
import visualizationRegistry from './visualizationRegistry';

export default () => {
  const dashboardState = useSelector((state: any) => state.visualizations.dashboard.state);

  const visualizations: any[] = [];
  for (const visualization in visualizationRegistry) {
    const vis = visualizationRegistry[visualization];
    if (vis.ConfigComponent !== undefined) {
      if (vis.hideSettingsInDashboard === undefined) {
        visualizations.push(vis);
      } else if (!vis.hideSettingsInDashboard) {
        visualizations.push(vis);
      }
    }
  }
  return (
    <div className={styles.configContainer}>
      {visualizations
        .filter((vis) => dashboardState.config.visualizations.includes(vis.id))
        .map((vis) => {
          return (
            <div key={vis.id}>
              <h2>{vis.label}</h2>
              <div className={styles.configComponentContainer}> {React.createElement(vis.ConfigComponent)}</div>
              <div className={styles.separator}></div>
            </div>
          );
        })}
    </div>
  );
};
