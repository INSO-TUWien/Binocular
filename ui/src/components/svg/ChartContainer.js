'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Measure from 'react-measure';

export default class ChartContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fullWidth: 0,
      fullHeight: 0,
      width: 0,
      height: 0,
      wMargin: 0,
      hMargin: 0
    };
  }

  render() {
    return (
      <Measure bounds onResize={dims => this.updateDimensions(dims.bounds)}>
        {({ measureRef }) =>
          <div ref={measureRef} className={this.props.className}>
            {this.props.children(this.state)}
          </div>}
      </Measure>
    );
  }

  updateDimensions(dimensions) {
    const fullWidth = dimensions.width;
    const fullHeight = dimensions.height;
    const wPct = this.props.widthShare || 0.7;
    const hPct = this.props.heightShare || 0.7;

    const width = fullWidth * wPct;
    const height = fullHeight * hPct;
    const wMargin = (fullWidth - width) / 2;
    const hMargin = (fullHeight - height) / 2;

    // this.scales.x.rangeRound([0, width]);
    // this.scales.y.rangeRound([height, 0]);

    this.setState({
      fullWidth,
      fullHeight,
      width,
      height,
      wMargin,
      hMargin
    });
  }
}

ChartContainer.propTypes = {
  widthShare: PropTypes.number,
  heightShare: PropTypes.number
};
