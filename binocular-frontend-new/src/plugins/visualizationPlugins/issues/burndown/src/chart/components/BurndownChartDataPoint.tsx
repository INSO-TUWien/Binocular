import * as React from 'react';
import classes from './burndownChartDataPoint.module.css';

export const BurndownChartDataPoint: React.FC<
  Pick<React.SVGProps<SVGCircleElement>, 'cx' | 'cy'> & {
    active: boolean;
    onMouseEnter: React.MouseEventHandler<SVGCircleElement>;
    onMouseLeave: React.MouseEventHandler<SVGCircleElement>;
  }
> = ({ cx, cy, active, onMouseEnter, onMouseLeave }) => (
  <circle
    r={4}
    cx={cx}
    cy={cy}
    fill={'lightblue'}
    stroke={'lightblue'}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={[classes['data-point'], active ? classes.active : ''].join(' ')}
  />
);
