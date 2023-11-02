'use strict';

import React from 'react';
import styles from './inlineLoadingIndicator.scss';

export default (props) => {
  return (
    <div className={styles.container}>
      <div className={styles.loading}></div>
    </div>
  );
};
