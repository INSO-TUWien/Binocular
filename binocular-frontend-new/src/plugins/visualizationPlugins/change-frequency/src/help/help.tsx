import React from 'react';
import styles from '../../styles.module.scss';

const HelpComponent: React.FC = () => {
  return (
    <div className={styles.helpContainer}>
      <h1>Change Frequency Visualization</h1>

      <p>
        The Change Frequency visualization displays the hierarchy of the codebase, showing how frequently files and modules are modified.
        This helps identify the most active parts of the codebase over time.
      </p>

      <h2>How to Use This Visualization</h2>

      <ul>
        <li>
          <strong>Date Range:</strong> Use the date range selectors at the top to select a time frame. Only changes that occurred within
          this time frame will be shown.
        </li>
        <li>
          <strong>Directory Navigation:</strong> Click either on the modules in the config panel or on the data points in the visualization
          to navigate through the codebase hierarchy. Use the breadcrumb navigation at the top to return to parent directories.
        </li>
        <li>
          <strong>Color Indicators:</strong> The color bar next to each file or module or the color of the datapoint in the visualization
          indicates the ratio of additions to deletions:
          <ul>
            <li>
              <span style={{ color: '#ff1a1a' }}>Red</span> - Mostly deletions
            </li>
            <li>
              <span style={{ color: '#ffcc00' }}>Yellow</span> - Equal additions and deletions
            </li>
            <li>
              <span style={{ color: '#2ecc40' }}>Green</span> - Mostly additions
            </li>
          </ul>
        </li>
      </ul>

      <h2>Understanding the Data</h2>

      <p>For each file or modules, the visualization shows:</p>

      <ul>
        <li>
          <strong>First modification:</strong> The date of the first commit that modified this file or module
        </li>
        <li>
          <strong>Last modification:</strong> The date of the last commit that modified this file or module
        </li>
        <li>
          <strong>Total additions:</strong> The number of lines added across all commits
        </li>
        <li>
          <strong>Total deletions:</strong> The number of lines removed across all commits
        </li>
        <li>
          <strong>Commit count:</strong> How many commits modified this file or module
        </li>
        <li>
          <strong>Modificaiton ownership:</strong> Who has modified this file or module and how many additions and deletions they have made
        </li>
      </ul>
    </div>
  );
};

export default HelpComponent;
