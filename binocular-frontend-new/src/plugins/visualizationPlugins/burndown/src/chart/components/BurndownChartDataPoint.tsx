import * as React from 'react';
import classes from './burndownChartDataPoint.module.css';

export const BurndownChartDataPoint: React.FC<
  Pick<React.SVGProps<SVGCircleElement>, 'cx' | 'cy'> & {
    active: boolean;
    onClick: React.MouseEventHandler<SVGCircleElement>;
  }
> = ({ cx, cy, active, onClick }) => (
  <circle
    r={4}
    cx={cx}
    cy={cy}
    fill={'lightblue'}
    stroke={'lightblue'}
    onClick={onClick}
    className={[classes['data-point'], active ? classes.active : ''].join(' ')}
  />
);
