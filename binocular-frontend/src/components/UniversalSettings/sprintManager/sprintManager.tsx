'use strict';

import * as React from 'react';
import styles from './sprintManager.module.scss';
import DateRangeFilter from '../../DateRangeFilter/dateRangeFilter';
import SprintDisplay from './sprintDisplay/sprintDisplay';
import moment from 'moment';
import Database from '../../../database/database';
import MilestoneList from './milestoneList/milestoneList';
import { Sprint } from '../../../types/sprintTypes';
import { Milestone } from '../../../types/milestoneTypes';
import { DateRange } from '../../../types/globalTypes';

interface Props {
  sprints: Sprint[];
  close: () => void;
  setSprints: (sprints: Sprint[]) => void;
}

export default (props: Props) => {
  const [sprints, setSprints] = React.useState(props.sprints);

  const [newSprintToAdd, setNewSprintToAdd] = React.useState<{ name: string; from: string | undefined; to: string | undefined }>({
    name: 'Sprint' + (sprints.length + 1),
    from: undefined,
    to: undefined,
  });
  const [recursiveSprints, setRecursiveSprints] = React.useState<{
    amount: number;
    sprintLength: number;
    startDateTime: string | undefined;
  }>({
    amount: 1,
    sprintLength: 1,
    startDateTime: undefined,
  });
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  let tmpID = 0;
  sprints.forEach((s: Sprint) => {
    if (s.id > tmpID) {
      tmpID = s.id;
    }
  });

  const [currID, setCurrID] = React.useState(tmpID);

  Database.getMilestoneData().then((milestones) => {
    setMilestones(milestones);
  });

  React.useEffect(() => {
    setSprints(props.sprints);
  }, [props.sprints]);

  const recursivelyAddSprints = () => {
    let from = moment(recursiveSprints.startDateTime);
    let to = moment(from).add(recursiveSprints.sprintLength, 'd');
    let id = currID;
    for (let i = 0; i < recursiveSprints.amount; i++) {
      id++;
      sprints.push({
        name: 'Sprint' + (sprints.length + 1),
        id: id,
        from: from.format(),
        to: to.format(),
      });
      from = moment(to);
      to = moment(from).add(recursiveSprints.sprintLength, 'd');
    }
    setRecursiveSprints({
      amount: 1,
      sprintLength: 1,
      startDateTime: undefined,
    });
    setCurrID(id);
    setSprints(sprints);
    props.setSprints(sprints);
  };
  const addAllMilestones = (milestones: Milestone[]) => {
    let id = currID;
    for (const milestone of milestones) {
      id++;
      sprints.push({
        name: milestone.title,
        id: id,
        iid: milestone.iid,
        from: moment(milestone.startDate).format(),
        to: moment(milestone.dueDate).format(),
      });
    }
    setCurrID(id);
    props.setSprints(sprints);
  };

  const addMilestone = (milestone: Milestone) => {
    const id = currID + 1;
    sprints.push({
      name: milestone.title,
      id: id,
      iid: milestone.iid,
      from: moment(milestone.startDate).format(),
      to: moment(milestone.dueDate).format(),
    });
    setCurrID(id);
    setSprints(sprints);
    props.setSprints(sprints);
  };

  const deleteSprint = (sprintID: number) => {
    const newSprints = sprints.filter((s: Sprint) => s.id !== sprintID);
    setSprints(newSprints);
    props.setSprints(newSprints);
  };

  const renameSprint = (sprintID: number, newName: string) => {
    setSprints(
      sprints.map((s: Sprint) => {
        if (s.id === sprintID) {
          s.name = newName;
        }
        return s;
      }),
    );
    props.setSprints(sprints);
  };

  return (
    <div className={styles.sprintManager}>
      <div className={styles.backgroundBlur} onClick={props.close}>
        <div
          className={styles.sprintManagerContainer}
          onClick={(event) => {
            event.stopPropagation();
          }}>
          <div className={styles.sprintManagerScroll}>
            <h1>Sprint Manager</h1>
            <div className={styles.sprintManagerPanel}>
              <h2>Sprints</h2>
              <SprintDisplay
                sprints={sprints}
                deleteSprint={(sprintID) => deleteSprint(sprintID)}
                renameSprint={(sprintID, name) => renameSprint(sprintID, name)}
              />
            </div>
            <div className={styles.sprintManagerPanel}>
              <h2>Add Sprint</h2>
              <div className={styles.mb05 + ' ' + styles.p05} id={'newSprintToAddNameInput'}>
                <span>Sprint Name:</span>
                <input
                  className={'input'}
                  placeholder={'Sprint Name'}
                  value={newSprintToAdd.name}
                  type={'text'}
                  onChange={(e) => {
                    setNewSprintToAdd({ name: e.target.value, from: newSprintToAdd.from, to: newSprintToAdd.to });
                  }}></input>
              </div>

              <div className={styles.mb05 + ' ' + styles.p05} id={'newSprintToAddDateInput'}>
                <span>Start & Enddate:</span>
                <DateRangeFilter
                  from={newSprintToAdd.from}
                  to={newSprintToAdd.to}
                  type={'date'}
                  onDateChanged={(date: DateRange) => {
                    if (date.from !== undefined) {
                      newSprintToAdd.from = date.from;
                    }
                    if (date.to !== undefined) {
                      newSprintToAdd.to = date.to;
                    }
                    setNewSprintToAdd(newSprintToAdd);
                  }}
                />
              </div>

              <div className={styles.p05}>
                <button
                  className={'button ' + styles.accentButton}
                  onClick={() => {
                    let falseInput = false;
                    if (newSprintToAdd.from === undefined || newSprintToAdd.to === undefined) {
                      document.getElementById('newSprintToAddDateInput')?.classList.remove(styles.wrongInput);
                      document.getElementById('newSprintToAddNameInput')?.offsetWidth;
                      document.getElementById('newSprintToAddDateInput')?.classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (newSprintToAdd.name.length === 0) {
                      document.getElementById('newSprintToAddNameInput')?.classList.remove(styles.wrongInput);
                      document.getElementById('newSprintToAddNameInput')?.offsetWidth;
                      document.getElementById('newSprintToAddNameInput')?.classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (falseInput) {
                      return;
                    }
                    const id = currID + 1;
                    sprints.push({ id: id, name: newSprintToAdd.name, from: newSprintToAdd.from, to: newSprintToAdd.to });
                    setCurrID(id);
                    setSprints(sprints);
                    setNewSprintToAdd({
                      name: 'Sprint' + (sprints.length + 1),
                      from: newSprintToAdd.from,
                      to: newSprintToAdd.to,
                    });
                    props.setSprints(sprints);
                  }}>
                  Add
                </button>
              </div>
            </div>
            <div className={styles.sprintManagerPanel}>
              <h2>Recursively Add Sprints</h2>
              <div className={styles.mb05 + ' ' + styles.p05} id={'recursivelyAddSprintsSprintAmountInput'}>
                <span>Amount of sprints to add:</span>
                <input
                  className={'input'}
                  placeholder={'Sprint length in days'}
                  value={recursiveSprints.amount}
                  type={'number'}
                  onChange={(e) => {
                    recursiveSprints.amount = parseInt(e.target.value);
                  }}></input>
              </div>
              <div className={styles.mb05 + ' ' + styles.p05} id={'recursivelyAddSprintsSprintLengthInput'}>
                <span>Sprint length in days:</span>
                <input
                  className={'input'}
                  placeholder={'Sprint length in days'}
                  value={recursiveSprints.sprintLength}
                  type={'number'}
                  onChange={(e) => {
                    recursiveSprints.sprintLength = parseInt(e.target.value);
                  }}></input>
              </div>
              <div className={styles.mb05 + ' ' + styles.p05} id={'recursivelyAddSprintsStartDateInput'}>
                <div>StartDate:</div>
                <input
                  id={'from'}
                  type={'date'}
                  className={styles.dateTimePicker}
                  value={recursiveSprints.startDateTime}
                  onChange={(e) => {
                    recursiveSprints.startDateTime = e.target.value;
                  }}
                />
              </div>
              <div className={styles.p05}>
                <button
                  className={'button ' + styles.accentButton}
                  onClick={() => {
                    let falseInput = false;
                    if (recursiveSprints.startDateTime === undefined) {
                      document.getElementById('recursivelyAddSprintsStartDateInput')?.classList.remove(styles.wrongInput);
                      document.getElementById('recursivelyAddSprintsStartDateInput')?.offsetWidth;
                      document.getElementById('recursivelyAddSprintsStartDateInput')?.classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (isNaN(recursiveSprints.amount)) {
                      document.getElementById('recursivelyAddSprintsSprintAmountInput')?.classList.remove(styles.wrongInput);
                      document.getElementById('recursivelyAddSprintsSprintAmountInput')?.offsetWidth;
                      document.getElementById('recursivelyAddSprintsSprintAmountInput')?.classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (isNaN(recursiveSprints.sprintLength)) {
                      document.getElementById('recursivelyAddSprintsSprintLengthInput')?.classList.remove(styles.wrongInput);
                      document.getElementById('recursivelyAddSprintsSprintLengthInput')?.offsetWidth;
                      document.getElementById('recursivelyAddSprintsSprintLengthInput')?.classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (falseInput) {
                      return;
                    }
                    recursivelyAddSprints();
                  }}>
                  Add
                </button>
              </div>
            </div>
            <div className={styles.sprintManagerPanel}>
              <h2>Import Sprints from Milestones</h2>
              <MilestoneList
                milestones={milestones.filter((m) => sprints.filter((s: Sprint) => s.iid === m.iid).length === 0)}
                addMilestone={(milestone) => addMilestone(milestone)}
              />
              <button
                className={'button ' + styles.accentButton}
                onClick={() => {
                  addAllMilestones(milestones.filter((m) => sprints.filter((s: Sprint) => s.iid === m.iid).length === 0));
                }}>
                Add All
              </button>
            </div>
            <button
              className={'button'}
              onClick={() => {
                props.close();
              }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
