'use strict';

import React from 'react';
import Measure from 'react-measure';

export default class ChartContainer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Measure bounds onResize={(dims) => this.props.onResize(dims.bounds)}>
        {({ measureRef }) => (
          <div ref={measureRef} className={this.props.className}>
            {this.props.children}
          </div>
        )}
      </Measure>
    );
  }
}
