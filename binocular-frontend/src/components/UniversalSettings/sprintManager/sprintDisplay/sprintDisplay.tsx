'use strict';

import React from 'react';
import styles from './sprintDisplay.module.scss';
import moment from 'moment';
import 'moment/locale/de';
import { Sprint } from '../../../../types/sprintTypes';

interface Props {
  sprints: Sprint[];
  deleteSprint: (id: number) => void;
  renameSprint: (id: number, newName: string) => void;
}

export default (props: Props) => {
  moment.locale('de');

  const renderSprintList = () => {
    if (props.sprints.length !== 0) {
      return props.sprints
        .sort((a: Sprint, b: Sprint): number => {
          return new (moment as any)(a.from).format('YYYYMMDD') - new (moment as any)(b.from).format('YYYYMMDD');
        })
        .map((sprint: Sprint) => {
          return (
            <div className={styles.sprintContainer} key={'sprint_' + sprint.id}>
              <div className={styles.sprintContainerFrom}>{moment(sprint.from).format('ll')}</div>
              <div className={styles.sprintContainerInner}>
                <div className={styles.sprintContainerInnerText}>
                  <input
                    type={'text'}
                    className={styles.sprintContainerInnerTextInput}
                    defaultValue={sprint.name}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter') {
                        e.target.blur();
                        props.renameSprint(sprint.id, e.target.value);
                      }
                    }}
                  />
                  <div>(Press &#8629; to save Name)</div>
                </div>
                <button className={styles.sprintContainerInnerDeleteButton} onClick={() => props.deleteSprint(sprint.id)}>
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
  };
  return (
    <div className={styles.sprints}>
      <div className={styles.sprintsScroll}>{renderSprintList()}</div>
    </div>
  );
};
