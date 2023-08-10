'use strict';

import React from 'react';
import styles from './sprintDisplay.scss';
import moment from 'moment';
import 'moment/locale/de';

export default class SprintDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    moment.locale('de');
  }
  componentWillReceiveProps(nextProps, nextContext) {
    this.forceUpdate();
  }

  renderSprintList() {
    if (this.props.sprints.length !== 0) {
      return this.props.sprints
        .sort((a, b) => new moment(a.from).format('YYYYMMDD') - new moment(b.from).format('YYYYMMDD'))
        .map((sprint) => {
          return (
            <div className={styles.sprintContainer} key={'sprint_' + sprint.name}>
              <div className={styles.sprintContainerFrom}>{moment(sprint.from).format('ll')}</div>
              <div className={styles.sprintContainerInner}>
                <div className={styles.sprintContainerInnerText}>
                  <input
                    type={'text'}
                    className={styles.sprintContainerInnerTextInput}
                    defaultValue={sprint.name}
                    onChange={(e) => this.props.renameSprint(sprint.id, e.target.value)}
                  />
                </div>
                <button className={styles.sprintContainerInnerDeleteButton} onClick={() => this.props.deleteSprint(sprint.id)}>
                  Delete
                </button>
              </div>
              <div className={styles.sprintContainerTo}>{moment(sprint.to).format('ll')}</div>
            </div>
          );
        });
    } else {
      return 'No sprints defined!';
    }
  }

  render() {
    return (
      <div className={styles.sprints}>
        <div className={styles.sprintsScroll}>{this.renderSprintList()}</div>
      </div>
    );
  }
}
