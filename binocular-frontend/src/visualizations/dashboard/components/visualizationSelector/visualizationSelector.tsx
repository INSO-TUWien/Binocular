'use strict';

import React from 'react';
import styles from './visualizationSelector.module.scss';

export default (props: { id: string; close: () => void; visualizations: any; addVisualization: (key: string) => void }) => {
  return (
    <div className={styles.visualizationSelector}>
      <div className={styles.backgroundBlur} onClick={props.close}>
        <div
          className={styles.visualizationContainer}
          onClick={(event) => {
            event.stopPropagation();
          }}>
          <h1>Select Visualization you want to add!</h1>
          <hr />
          {Object.keys(props.visualizations).map((viz) => {
            const visualization = props.visualizations[viz];
            return (
              <button
                key={visualization.id}
                className={styles.visualizationSelectButton}
                onClick={() => {
                  props.addVisualization(viz);
                  props.close();
                }}>
                {visualization.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
