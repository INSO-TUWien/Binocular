'use strict';

import _ from 'lodash';
import React from 'react';
import Measure from 'react-measure';

import styles from './legendCompact.scss';

const ICON_WIDTH = 15;
const ICON_HEIGHT = 15;

export default class LegendCompact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,     //String, text to display
      color: props.color    //String, hex code
    };
  }

  render() {
    return (<div className={styles.legend}>
      <svg className={styles.icon} width={ICON_WIDTH} height={ICON_HEIGHT}>
        <rect width={ICON_HEIGHT} height={ICON_WIDTH} fill={this.state.color} />
      </svg>
      <text>
        {this.state.text}
      </text>
    </div>);
  }
}
