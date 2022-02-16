'use strict';

import React from 'react';

export default class TeamArwareness extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log('Chraph state');
    console.log(this.props);
    return <h1>Hello World</h1>;
  }
}
