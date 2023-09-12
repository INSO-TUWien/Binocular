'use strict';

import React, { useState, useEffect } from 'react';
import styles from './sprintManager.scss';
import DateRangeFilter from '../../DateRangeFilter/dateRangeFilter';
import SprintDisplay from './sprintDisplay/sprintDisplay';
import moment from 'moment';
import Database from '../../../database/database';
import MilestoneList from './milestoneList/milestoneList';

export default (props) => {
  let [sprints, setSprints] = useState(props.sprints);

  const [newSprintToAdd, setNewSprintToAdd] = useState({
    name: 'Sprint' + (sprints.length + 1),
    from: undefined,
    to: undefined,
  });
  const [recursiveSprints, setRecursiveSprints] = useState({
    amount: 1,
    sprintLength: 1,
    startDateTime: undefined,
  });
  const [milestones, setMilestones] = useState([]);
  let tmpID = 0;
  sprints.forEach((s) => {
    if (s.id > tmpID) {
      tmpID = s.id;
    }
  });

  let [currID, setCurrID] = useState(tmpID);

  Database.getMilestoneData().then((milestones) => {
    setMilestones(milestones);
  });

  useEffect(() => {
    setSprints(props.sprints);
  }, [props.sprints]);

  const recursivelyAddSprints = () => {
    let from = moment(recursiveSprints.startDateTime);
    let to = moment(from).add(recursiveSprints.sprintLength, 'd');
    for (let i = 0; i < recursiveSprints.amount; i++) {
      currID++;
      sprints.push({
        name: 'Sprint' + (sprints.length + 1),
        id: currID,
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
    setCurrID(currID);
    setSprints(sprints);
    props.setSprints(sprints);
  };
  const addAllMilestones = (milestones) => {
    for (const milestone of milestones) {
      currID++;
      sprints.push({
        name: milestone.title,
        id: currID,
        iid: milestone.iid,
        from: moment(milestone.startDate).format(),
        to: moment(milestone.dueDate).format(),
      });
    }
    setCurrID(currID);
    props.setSprints(sprints);
  };

  const addMilestone = (milestone) => {
    currID++;
    sprints.push({
      name: milestone.title,
      id: currID,
      iid: milestone.iid,
      from: moment(milestone.startDate).format(),
      to: moment(milestone.dueDate).format(),
    });
    setCurrID(currID);
    setSprints(sprints);
    props.setSprints(sprints);
  };

  const deleteSprint = (sprintID) => {
    sprints = sprints.filter((s) => s.id !== sprintID);
    setSprints(sprints);
    props.setSprints(sprints);
  };

  const renameSprint = (sprintID, name) => {
    setSprints(
      sprints.map((s) => {
        if (s.id === sprintID) {
          s.name = name;
        }
        return s;
      })
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
                  onDateChanged={(date) => {
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
                      document.getElementById('newSprintToAddDateInput').classList.remove(styles.wrongInput);
                      document.getElementById('newSprintToAddNameInput').offsetWidth;
                      document.getElementById('newSprintToAddDateInput').classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (newSprintToAdd.name.length === 0) {
                      document.getElementById('newSprintToAddNameInput').classList.remove(styles.wrongInput);
                      document.getElementById('newSprintToAddNameInput').offsetWidth;
                      document.getElementById('newSprintToAddNameInput').classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (falseInput) {
                      return;
                    }
                    currID++;
                    newSprintToAdd.id = currID;
                    sprints.push(newSprintToAdd);
                    setCurrID(currID);
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
                    recursiveSprints.amount = e.target.value;
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
                    recursiveSprints.sprintLength = e.target.value;
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
                      document.getElementById('recursivelyAddSprintsStartDateInput').classList.remove(styles.wrongInput);
                      document.getElementById('recursivelyAddSprintsStartDateInput').offsetWidth;
                      document.getElementById('recursivelyAddSprintsStartDateInput').classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (recursiveSprints.amount === '') {
                      document.getElementById('recursivelyAddSprintsSprintAmountInput').classList.remove(styles.wrongInput);
                      document.getElementById('recursivelyAddSprintsSprintAmountInput').offsetWidth;
                      document.getElementById('recursivelyAddSprintsSprintAmountInput').classList.add(styles.wrongInput);
                      falseInput = true;
                    }
                    if (recursiveSprints.sprintLength === '') {
                      document.getElementById('recursivelyAddSprintsSprintLengthInput').classList.remove(styles.wrongInput);
                      document.getElementById('recursivelyAddSprintsSprintLengthInput').offsetWidth;
                      document.getElementById('recursivelyAddSprintsSprintLengthInput').classList.add(styles.wrongInput);
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
                milestones={milestones.filter((m) => sprints.filter((s) => s.iid === m.iid).length === 0)}
                addMilestone={(milestone) => addMilestone(milestone)}
              />
              <button
                className={'button ' + styles.accentButton}
                onClick={() => {
                  addAllMilestones(milestones.filter((m) => sprints.filter((s) => s.iid === m.iid).length === 0));
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
