'use strict';

import React from 'react';
import styles from './sprintManager.scss';
import DateRangeFilter from '../../DateRangeFilter/dateRangeFilter';
import _ from 'lodash';
import SprintDisplay from './sprintDisplay/sprintDisplay';
import moment from 'moment';

export default class SprintManager extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sprints: [],
      newSprintToAdd: {
        name: '',
        from: undefined,
        to: undefined,
      },
      recursiveSprints: {
        amount: 1,
        sprintLength: 1,
        startDateTime: undefined,
      },
    };

    this.state.newSprintToAdd.name = 'Sprint' + (this.state.sprints.length + 1);
  }

  recursivelyAddSprints() {
    const recursiveSprints = this.state.recursiveSprints;
    const sprints = this.state.sprints;
    let from = moment(recursiveSprints.startDateTime);
    let to = moment(from).add(recursiveSprints.sprintLength, 'd');
    for (let i = 0; i < recursiveSprints.amount; i++) {
      sprints.push({
        name: 'Sprint' + (sprints.length + 1),
        from: from.format(),
        to: to.format(),
      });

      from = moment(to);
      to = moment(from).add(recursiveSprints.sprintLength, 'd');
    }
    this.setState({
      recursiveSprints: {
        amount: 1,
        sprintLength: 1,
        startDateTime: undefined,
      },
      sprints: sprints,
    });
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
            <div className={styles.sprintManagerScroll}>
              <h1>Sprint Manager</h1>
              <div className={styles.sprintManagerPanel}>
                <h2>Sprints</h2>
                <SprintDisplay sprints={this.state.sprints} />
              </div>
              <div className={styles.sprintManagerPanel}>
                <h2>Add Sprint</h2>
                <div className={styles.mb05 + ' ' + styles.p05} id={'newSprintToAddNameInput'}>
                  <span>Sprint Name:</span>
                  <input
                    className={'input'}
                    placeholder={'Sprint Name'}
                    value={this.state.newSprintToAdd.name}
                    type={'text'}
                    onChange={(e) => {
                      this.setState({
                        newSprintToAdd: { name: e.target.value, from: this.state.newSprintToAdd.from, to: this.state.newSprintToAdd.to },
                      });
                    }}></input>
                </div>

                <div className={styles.mb05 + ' ' + styles.p05} id={'newSprintToAddDateInput'}>
                  <span>Start & Enddate:</span>
                  <DateRangeFilter
                    from={this.state.newSprintToAdd.from}
                    to={this.state.newSprintToAdd.to}
                    onDateChanged={(date) => {
                      const newSprintToAdd = this.state.newSprintToAdd;
                      if (date.from !== undefined) {
                        newSprintToAdd.from = date.from;
                      }
                      if (date.to !== undefined) {
                        newSprintToAdd.to = date.to;
                      }
                      this.setState({ newSprintToAdd: newSprintToAdd });
                    }}
                  />
                </div>

                <div className={styles.p05}>
                  <button
                    className={'button ' + styles.accentButton}
                    onClick={() => {
                      const newSprintToAdd = this.state.newSprintToAdd;
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
                      const sprints = this.state.sprints;
                      sprints.push(newSprintToAdd);
                      this.setState({
                        sprints: sprints,
                        newSprintToAdd: { name: 'Sprint' + (sprints.length + 1), from: newSprintToAdd.from, to: newSprintToAdd.to },
                      });
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
                    value={this.state.recursiveSprints.amount}
                    type={'number'}
                    onChange={(e) => {
                      this.setState({
                        recursiveSprints: {
                          amount: e.target.value,
                          sprintLength: this.state.recursiveSprints.sprintLength,
                          startDateTime: this.state.recursiveSprints.startDateTime,
                        },
                      });
                    }}></input>
                </div>
                <div className={styles.mb05 + ' ' + styles.p05} id={'recursivelyAddSprintsSprintLengthInput'}>
                  <span>Sprint length in days:</span>
                  <input
                    className={'input'}
                    placeholder={'Sprint length in days'}
                    value={this.state.recursiveSprints.sprintLength}
                    type={'number'}
                    onChange={(e) => {
                      this.setState({
                        recursiveSprints: {
                          amount: this.state.recursiveSprints.amount,
                          sprintLength: e.target.value,
                          startDateTime: this.state.recursiveSprints.startDateTime,
                        },
                      });
                    }}></input>
                </div>
                <div className={styles.mb05 + ' ' + styles.p05} id={'recursivelyAddSprintsStartDateInput'}>
                  <div>StartDate:</div>
                  <input
                    id={'from'}
                    type="datetime-local"
                    className={styles.dateTimePicker}
                    value={this.state.from}
                    onChange={(e) => {
                      const recursiveSprints = this.state.recursiveSprints;
                      recursiveSprints.startDateTime = e.target.value;

                      this.setState({
                        recursiveSprints: recursiveSprints,
                      });
                    }}
                  />
                </div>
                <div className={styles.p05}>
                  <button
                    className={'button ' + styles.accentButton}
                    onClick={() => {
                      const recursiveSprints = this.state.recursiveSprints;
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
                      this.recursivelyAddSprints();
                    }}>
                    Add
                  </button>
                </div>
              </div>
              <div className={styles.sprintManagerPanel}>
                <h2>Suggested Sprints from Milestones</h2>
              </div>
              <button
                className={'button'}
                onClick={() => {
                  this.props.close();
                }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
