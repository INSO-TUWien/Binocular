'use strict';

import { createAction } from 'redux-actions';
import { fork, takeEvery, throttle } from 'redux-saga/effects';
import { fetchFactory, mapSaga, timestampedActionFactory } from '../../../sagas/utils';
import getCommits from './getCommits';

export const setActivityScale = createAction('SET_TEAM_AWARENESS_ACTIVITY_SCALE');

export const requestTeamAwarenessData = createAction('REQUEST_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessData = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA');
export const receiveTeamAwarenessDataError = timestampedActionFactory('RECEIVE_TEAM_AWARENESS_DATA');

export const requestRefresh = createAction('REQUEST_REFRESH');
const refresh = createAction('REFRESH');

export default function*() {
  yield* fetchAwarenessData();

  yield fork(watchRefreshRequests);
  yield fork(watchMessages);
  yield fork(watchRefresh);
}

function* watchRefreshRequests() {
  yield throttle(2000, 'REQUEST_REFRESH', mapSaga(refresh));
}
function* watchRefresh() {
  yield takeEvery('REFRESH', fetchAwarenessData);
}
function* watchMessages() {
  yield takeEvery('message', mapSaga(requestRefresh));
}

/**
 *
 * @param commits{[{
 *   date: Date,
 *   stats: {additions: number, deletions: number},
 *   stakeholder: {id: number}
 * }]} Commit data
 * @return {{activityTimeline: *[], stakeholders: *[]}}
 */
function processData(commits) {

  /** @type {Map<number, any>} */
  const stakeholders = new Map();

  /** @type [{date:Date, amount: number} ] */
  const activity = [];

  const dataBoundaries = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MIN_SAFE_INTEGER
  };
  console.log(commits);
  commits.forEach(c => {
    if (!stakeholders.has(c.stakeholder.id)) {
      stakeholders.set(c.stakeholder.id, {
        id: c.stakeholder.id,
        signature: c.stakeholder.gitSignature,
        name: c.stakeholder.id,
        activity: 0
      });
    }
    const calculatedActivity = calculateActivity(c);
    const stakeholder = stakeholders.get(c.stakeholder.id);
    stakeholder.activity += calculatedActivity;
    activity.push({ date: c.date, amount: calculatedActivity });
    updateBoundaries(dataBoundaries, stakeholder.activity);
  });

  return {
    stakeholders: Array.from(stakeholders.values()),
    activityTimeline: activity,
    dataBoundaries
  };
}

function updateBoundaries(boundaries, value) {
  if (value < boundaries.min) {
    boundaries.min = value;
  }
  if (value > boundaries.max) {
    boundaries.max = value;
  }
}

function calculateActivity(commit) {
  return 1;
}

export const fetchAwarenessData = fetchFactory(
  function*() {
    //const state = getState(yield select());
    return yield Promise.all([getCommits()]).then(result => {
      const processed = processData(result[0]);
      return {
        stakeholders: processed.stakeholders,
        activityTimeline: processed.activityTimeline,
        dataBoundaries: processed.dataBoundaries
      };
    });
  },
  requestTeamAwarenessData,
  receiveTeamAwarenessData,
  receiveTeamAwarenessDataError
);
