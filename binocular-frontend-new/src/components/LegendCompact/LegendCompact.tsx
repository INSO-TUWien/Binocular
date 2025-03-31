'use strict';

import React from 'react';

import styles from './legendCompact.module.scss';

const ICON_WIDTH = 15;
const ICON_HEIGHT = 15;

// Define props interface
interface LegendCompactProps {
  color: string;
  color2?: string;
  color3?: string;
  text: string;
}

export default class LegendCompact extends React.Component<LegendCompactProps> {
  constructor(props: LegendCompactProps) {
    super(props);
  }

  render(): React.ReactNode {
    const rects: React.ReactNode[] = [];
    
    if (this.props.color2) {
      if (this.props.color3) {
        rects.push(<rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} fill={this.props.color} key={this.props.color} />);
        rects.push(
          <rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} x={ICON_WIDTH / 3} fill={this.props.color2} key={this.props.color2} />,
        );
        rects.push(
          <rect width={ICON_WIDTH / 3} height={ICON_HEIGHT} x={(ICON_WIDTH / 3) * 2} fill={this.props.color3} key={this.props.color3} />,
        );
      } else {
        rects.push(<rect width={ICON_WIDTH / 2} height={ICON_HEIGHT} fill={this.props.color} key={this.props.color} />);
        rects.push(
          <rect width={ICON_WIDTH / 2} height={ICON_HEIGHT} x={ICON_WIDTH / 2} fill={this.props.color2} key={this.props.color2} />,
        );
      }
    } else {
      rects.push(<rect width={ICON_WIDTH} height={ICON_HEIGHT} fill={this.props.color} key={this.props.color} />);
    }

    return (
      <div className={styles.legend}>
        <svg className={styles.icon} width={ICON_WIDTH} height={ICON_HEIGHT}>
          {rects}
        </svg>
        <span>{this.props.text}</span>
      </div>
    );
  }
}