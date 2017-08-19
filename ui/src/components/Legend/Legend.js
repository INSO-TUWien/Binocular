'use strict';

import _ from 'lodash';
import cx from 'classnames';
import React from 'react';
import Measure from 'react-measure';

import styles from './legend.scss';

const ICON_WIDTH = 15;
const ICON_HEIGHT = 15;
const ICON_VERTICAL_MARGIN = ICON_HEIGHT / 2;
const ICON_HORIZONTAL_MARGIN = 5;

export default class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dims: {
        height: 0,
        width: 0
      },
      expand: null
    };
  }

  render() {
    const categories = this.props.categories;

    const items = _.map(categories, (cat, i) => {
      return (
        <g
          key={i}
          transform={`translate(0,${(ICON_HEIGHT + ICON_VERTICAL_MARGIN) * i})`}
          onMouseEnter={() => this.setState({ expand: i })}
          onMouseLeave={() => this.setState({ expand: null })}>
          {(this.state.expand === null || this.state.expand === i) &&
            <g>
              <LegendIcon
                width={ICON_WIDTH}
                height={ICON_HEIGHT}
                styles={cat.style ? [cat.style] : cat.subLegend.map(l => l.style)}
              />
              <text x={ICON_WIDTH + ICON_HORIZONTAL_MARGIN} y={ICON_HEIGHT / 2 + 1}>
                {cat.name}
              </text>
              {cat.subLegend &&
                this.state.expand === i &&
                <Legend
                  x={ICON_WIDTH + ICON_HORIZONTAL_MARGIN}
                  y={ICON_HEIGHT + ICON_VERTICAL_MARGIN}
                  categories={cat.subLegend}
                />}
            </g>}
        </g>
      );
    });

    const transform = `translate(${this.props.x}, ${this.props.y})`;

    return (
      <g transform={transform} className={styles.legend}>
        <rect
          width={this.state.dims.width}
          height={this.state.dims.height}
          className={styles.background}
        />
        <Measure bounds onResize={dims => this.setState({ dims: dims.bounds })}>
          {({ measureRef }) =>
            <g ref={measureRef}>
              {items}
            </g>}
        </Measure>
      </g>
    );
  }
}

const LegendIcon = props => {
  const tileLength = props.width / props.styles.length;

  const rects = _.map(props.styles, (style, i) =>
    <rect key={i} x={i * tileLength} width={tileLength} height={props.height} style={style} />
  );

  return (
    <g>
      {rects}
    </g>
  );
};
