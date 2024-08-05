'use strict';

import React from 'react';
import styles from './bubbleChart.module.scss';

interface Props {
  data: ToolTipData[];
  x: number;
  y: number;
  visible: boolean;
}

export interface ToolTipData {
  label: string;
  value: string | number;
}

export default class BubbleToolTip extends React.Component<Props> {
  private style;
  constructor(props: Props | Readonly<Props>) {
    super(props);
  }

  setStyle() {
    this.style = {
      left: this.props.x + 'px',
      top: this.props.y + 'px',
      opacity: this.props.visible ? 1 : 0,
    };
  }

  render() {
    this.setStyle();
    return (
      <div style={this.style} className={styles.tooltip}>
        {this.props.data.map((data, index) => (
          <div key={index}>
            <p>{data.label + ': ' + data.value}</p>
          </div>
        ))}
      </div>
    );
  }
}
