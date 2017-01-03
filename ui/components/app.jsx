'use strict';

import React from 'react';
import Sidebar from './sidebar';
import ConfigButton from './config-button';
import styles from './app.css';

import classnames from 'classnames';


export default class App extends React.Component {


  render() {
    return (
      <div className={styles.app}>
        <Sidebar />
        <div className={styles.chartPanel}>
          <h1>Chart area</h1>
        </div>
        <ConfigButton />
      </div>
    );
  }
}
