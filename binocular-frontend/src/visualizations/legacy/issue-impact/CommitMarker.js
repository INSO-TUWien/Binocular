'use strict';

import React from 'react';
import styles from './CommitMarker.module.scss';

export default class CommitMarker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showText: false,
    };
  }

  render() {
    return (
      <g className={styles.commit} transform={`translate(${this.props.x}, ${this.props.y})`}>
        <circle
          key={this.props.commit.sha}
          r="10"
          onClick={this.props.onClick}
          onMouseOver={() => this.setState({ showText: true })}
          onMouseOut={() => this.setState({ showText: false })}
        />
        {this.state.showText && (
          <text x="15" y="5">
            {this.props.commit.sha.substring(0, 7)} {this.props.commit.messageHeader}
          </text>
        )}
      </g>
    );
  }
}
