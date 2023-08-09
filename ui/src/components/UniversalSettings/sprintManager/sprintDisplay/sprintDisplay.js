'use strict';

import React from 'react';
import styles from './sprintDisplay.scss';
import moment from 'moment';

export default class SprintDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  componentWillReceiveProps(nextProps, nextContext) {
    this.forceUpdate();
  }
  render() {
    return (
      <div className={styles.sprints}>
        <div className={styles.sprintsScroll}>
          {this.props.sprints.length === 0
            ? 'No sprints defined!'
            : this.props.sprints.map((sprint) => {
                return (
                  <div className={styles.sprintContainer} key={'sprint_' + sprint.name}>
                    <div className={styles.sprintContainerFrom}>{moment(sprint.from).format('lll')}</div>
                    <div className={styles.sprintContainerName}>{sprint.name}</div>
                    <div className={styles.sprintContainerTo}>{moment(sprint.to).format('lll')}</div>
                  </div>
                );
              })}
        </div>
      </div>
    );
  }
}
