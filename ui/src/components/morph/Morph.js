'use strict';

import React from 'react';

export default class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <g>
        {this.props.children}
      </g>
    );
  }
}
