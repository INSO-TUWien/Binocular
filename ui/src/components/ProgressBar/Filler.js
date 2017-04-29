'use strict';

import cx from 'classnames';

import styles from './progress-bar.scss';

const Filler = props => {
  const width = `${Math.round(props.share * props.progress * 100)}%`;

  return (
    <div className={cx(styles.fillerContainer)} style={{ width }}>
      <div className={cx(styles.filler)} />
      <div className={styles.children}>
        {props.children}
      </div>
    </div>
  );
};

export default Filler;
