'use strict';

import React from 'react';
import BubbleChart from '../components/BubbleChart/BubbleChart';

export default class TeamAwareness extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    console.log(this.props);

    const { stakeholders } = this.props.data;

    return (
      <div>
        <BubbleChart content={stakeholders} />
      </div>
    );
  }
}
