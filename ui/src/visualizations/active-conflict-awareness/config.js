'use strict';

import {connect} from 'react-redux';
import styles from './styles.scss';
import React from 'react';


const ActiveConflictAwarenessConfigComponent = (props) => {
  return (
    <div className={styles.configContainer}>

    </div>
  );
};

const ActiveConflictAwarenessConfig = connect(
)(ActiveConflictAwarenessConfigComponent);

export default ActiveConflictAwarenessConfig;
