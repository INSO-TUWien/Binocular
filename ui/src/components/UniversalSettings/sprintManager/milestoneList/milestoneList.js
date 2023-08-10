'use strict';

import React from 'react';
import styles from './milestoneList.scss';
import moment from 'moment';
import 'moment/locale/de';

export default class MilestoneList extends React.PureComponent {
  constructor(props) {
    super(props);
    moment.locale('de');
  }
  componentWillReceiveProps(nextProps, nextContext) {
    this.forceUpdate();
  }
  render() {
    return (
      <div className={styles.milestones}>
        <div className={styles.milestonesScroll}>
          {this.props.milestones.map((milestone) => {
            return (
              <div className={styles.milestone}>
                <div className={styles.milestoneText}>
                  <div>{milestone.title}</div>
                  <div>Start Date: {moment(milestone.startDate).format('ll')}</div>
                  <div>Due Date: {moment(milestone.dueDate).format('ll')}</div>
                </div>
                <button
                  className={styles.milestoneAddButton}
                  onClick={() => {
                    this.props.addMilestone(milestone);
                  }}>
                  Add
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
