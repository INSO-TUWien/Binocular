'use strict';

import React from 'react';
import Sidebar from './sidebar';
import ConfigButton from './config-button';
import ConfigDialog from './config-dialog';
import styles from './app.css';

export default class App extends React.Component {

  render() {
    return (
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.chartPanel}>
          <h1>Chart area</h1>
          <span className='icon'>
            <i className='fa fa-envelope' />
          </span>
        </div>
        <ConfigButton />
        <ConfigDialog />
      </div>
    );
  }
}
