'use strict';

import React from 'react';
import visualizationRegistry from '../../visualizationRegistry';
import styles from './visualizationSelector.css';

export default class VisualizationSelector extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.visualizationSelector}>
        <div className={styles.backgroundBlur} onClick={this.props.close}>
          <div
            className={styles.visualizationContainer}
            onClick={(event) => {
              event.stopPropagation();
            }}>
            <h1>Select Visualization you want to add!</h1>
            <hr />
            {Object.keys(this.props.visualizations).map((viz) => {
              const visualization = this.props.visualizations[viz];
              return (
                <button
                  key={visualization.id}
                  className={styles.visualizationSelectButton}
                  onClick={(e) => {
                    this.props.addVisualization(viz);
                    this.props.close();
                  }}>
                  {visualization.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
