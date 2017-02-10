'use strict';

import _ from 'lodash';
import React from 'react';
import cx from 'classnames';
import * as d3 from 'd3';

import styles from './progress-bar.scss';

class Filler extends React.Component {

  constructor() {
    super();
  }

  render() {

    const width = `${Math.round(this.props.share * this.props.progress * 100)}%`;

    console.log( width );

    return (
      <div className={cx(styles.fillerContainer)}
           style={{width}}>
        <div className={cx(styles.filler)} />
        <div className={styles.children}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Filler;
