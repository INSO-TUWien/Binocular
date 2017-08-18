'use strict';

import _ from 'lodash';
import cx from 'classnames';

import styles from './legend.scss';

const ICON_WIDTH = 15;
const ICON_HEIGHT = 15;
const ICON_VERTICAL_MARGIN = ICON_HEIGHT / 2;
const ICON_HORIZONTAL_MARGIN = 5;

const Legend = props => {
  const categories = props.categories;

  const items = _.map(categories, (cat, i) => {
    return (
      <g key={i} transform={`translate(0,${(ICON_HEIGHT + ICON_VERTICAL_MARGIN) * i})`}>
        <rect width={ICON_WIDTH} height={ICON_HEIGHT} style={cat.style} />
        <text x={ICON_WIDTH + ICON_HORIZONTAL_MARGIN} y={ICON_HEIGHT / 2 + 1}>
          {cat.name}
        </text>
      </g>
    );
  });

  const transform = `translate(${props.x}, ${props.y})`;

  return (
    <g className={styles.legend} transform={transform}>
      {items}
    </g>
  );
};

export default Legend;
