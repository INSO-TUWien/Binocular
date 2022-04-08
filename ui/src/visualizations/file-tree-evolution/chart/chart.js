'use strict';

import React from 'react';

import _ from 'lodash';

import Sunburst from './Sunburst';

export default class FileTreeEvolution extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return ( 
      <Sunburst />
    );
  }
}
