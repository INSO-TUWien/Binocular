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
  }

  render() {
    let rects = [];
    if(this.props.color2) {
      rects.push(<rect width={ICON_WIDTH/2} height={ICON_HEIGHT} fill={this.props.color} key={this.props.color}/>);
      rects.push(<rect width={ICON_WIDTH/2} height={ICON_HEIGHT} x={ICON_WIDTH/2} fill={this.props.color2} key={this.props.color2}/>);
    }else{
      rects.push(<rect width={ICON_WIDTH} height={ICON_HEIGHT} fill={this.props.color} key={this.props.color}/>);
    }

    return (<div className={styles.legend}>
      <svg className={styles.icon} width={ICON_WIDTH} height={ICON_HEIGHT}>
        {rects}
      </svg>
      <text>
        {this.props.text}
      </text>
    </div>);
  }
}
