'use strict';

import cx from 'classnames';

import styles from './progress-bar.scss';

const Pie = props => {
  const width = `${Math.round(props.share * props.progress * 100)}%`;

  return (
    <div className="pie">
      Start: {props.start}
      Value: {props.value}
    </div>
  );
};

export default Pie;
