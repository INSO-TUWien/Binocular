'use strict';

import _ from 'lodash';
import * as d3 from 'd3';
import { ClosingPathContext } from '../../../utils.js';

const StackedArea = props => {
  const series = props.series;

  const areas = _.map(series, (s, i) => {
    const path = new ClosingPathContext();

    return {
      line: d3
        .line()
        .x(props.x)
        .y(d => {
          const values = _.take(series, i + 1).map(s => s.extract(d));
          return props.y(values);
        })
        .context(path),
      path,
      series: s
    };
  });

  _.each(areas, area => {
    area.line(props.data);
    if (props.fillToRight) {
      area.path.fillToRight(props.fillToRight);
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

  return (
    <g>
      {paths}
    </g>
  );
};

export default StackedArea;
