'use strict';

import React from 'react';
import styles from './sprintManager.scss';

export default class SprintManager extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className={styles.sprintManager}>
        <div className={styles.backgroundBlur} onClick={this.props.close}>
          <div
            className={styles.sprintManagerContainer}
            onClick={(event) => {
              event.stopPropagation();
            }}>
            <h1>Sprint Manager</h1>
          </div>
        </div>
      </div>
    );
  }
}
