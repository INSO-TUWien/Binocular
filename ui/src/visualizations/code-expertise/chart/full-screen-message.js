'use strict';

import styles from '../styles.scss';

const FullScreenMessage = ({ message }) => {
  return (
    <div className={styles.messageContainer}>
      <h1>{message}</h1>
    </div>
  );
};

export default FullScreenMessage;
