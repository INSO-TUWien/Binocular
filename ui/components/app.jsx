'use strict';

import React from 'react';
import Sidebar from './sidebar';
import ConfigButton from './config-button';
import ConfigDialog from './config-dialog';
import Notifications from './notifications';
import ProgressBar from './progress-bar';
import styles from './app.css';

import CodeOwnershipRiver from './visualizations/code-ownership-river';

export default class App extends React.Component {

  render() {
    return (
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.chartPanel}>
          <ProgressBar />
          <CodeOwnershipRiver />
        </div>
        <Notifications />
        <ConfigButton />
        <ConfigDialog />
      </div>
    );
  }
}
