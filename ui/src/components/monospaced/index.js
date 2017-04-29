'use strict';

import React from 'react';
import styles from './monospaced.scss';

export default class Monospaced extends React.Component {
  render() {
    return (
      <span className={styles.monospaced}>{this.props.children}</span>
    );
  }
}
