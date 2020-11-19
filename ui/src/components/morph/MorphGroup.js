'use strict';

import _ from 'lodash';
import React from 'react';

export default class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    console.log('next children:', nextProps.children);
    _.each(nextProps.children, child => {
      console.log(child.props);
    });
  }

  render() {
    return (
      <g>
        {this.props.children}
      </g>
    );
  }
}
