'use strict';

import * as React from 'react';
import styles from './milestoneList.module.scss';
import moment from 'moment';
import 'moment/locale/de';
import { Milestone } from '../../../../types/milestoneTypes';

interface Props {
  milestones: Milestone[];
  addMilestone: (milestone: Milestone) => void;
}

export default (props: Props) => {
  moment.locale('de');
  return (
    <div className={styles.milestones}>
      <div className={styles.milestonesScroll}>
        {props.milestones.map((milestone: Milestone) => {
          return (
            <div className={styles.milestone} key={'m_' + milestone.iid}>
              <div className={styles.milestoneText}>
                <div>{milestone.title}</div>
                <div>Start Date: {moment(milestone.startDate).format('ll')}</div>
                <div>Due Date: {moment(milestone.dueDate).format('ll')}</div>
              </div>
              <button
                className={styles.milestoneAddButton}
                onClick={() => {
                  props.addMilestone(milestone);
                }}>
                Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
