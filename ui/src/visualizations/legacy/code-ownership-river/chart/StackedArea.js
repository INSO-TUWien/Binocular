'use strict';

import _ from 'lodash';
import React from 'react';
import * as d3 from 'd3';
import { ClosingPathContext } from '../../../../utils';

export default class StackedArea extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const series = this.props.series;

    const areas = _.map(series, (s, i) => {
      const path = new ClosingPathContext();

      return {
        line: d3
          .line()
          .x((d) => this.props.x(this.props.extractX(d)))
          .y((d) => {
            const values = _.take(series, i + 1).map((s) => s.extractY(d));
            return this.props.y(this.props.sum(values));
          })
          .context(path),
        path,
        series: s,
      };
    });

    _.each(areas, (area) => {
      area.line(this.props.data);
      if (this.props.fillToRight) {
        area.path.fillToRight(this.props.fillToRight);
      }
    });

    const paths = [];

    for (let i = areas.length - 1; i >= 0; i--) {
      const area = areas[i];
      const areaBelow = i === 0 ? null : areas[i - 1];

      if (areaBelow) {
        area.path.closeToPath(areaBelow.path);
      } else {
        area.path.closeToBottom();
      }

      paths.push(
        <path
          key={i}
          d={area.path}
          style={area.series.style}
          className={area.series.className}
          onMouseEnter={area.series.onMouseEnter}
          onMouseLeave={area.series.onMouseLeave}
        />
      );
    }

    return <g>{paths}</g>;
  }
}
