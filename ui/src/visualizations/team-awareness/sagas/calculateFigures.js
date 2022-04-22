import { put, select } from 'redux-saga/effects';
import { processTeamAwarenessData } from './index';
import { getState } from '../util/util';

export default function*() {
  const appState = yield select();
  yield put(processTeamAwarenessData(processData(appState)));
}

function processData(appState) {
  const vizState = getState(appState);

  /** @type {Map<number, any>} */
  const stakeholders = new Map();

  /** @type {Map<string, any>} */
  const activities = new Map();

  const dataBoundaries = {
    min: 0,
    max: Number.MIN_SAFE_INTEGER
  };

  let activityCalculator = selectCalculationFunction(vizState.config);
  console.log(vizState.data.data);
  if (vizState.config.activityRestricted === true) {
    const from = Date.parse(vizState.config.activityDims[0]);
    const to = Date.parse(vizState.config.activityDims[1]);
    activityCalculator = filterCommitOnDate(from, to, activityCalculator);
  }

  if (vizState.config.selectedBranch && vizState.config.selectedBranch !== 'all') {
    activityCalculator = filterCommitOnBranch(vizState.config.selectedBranch, activityCalculator);
  }

  vizState.data.data.commits.forEach(c => {
    const calculatedActivity = activityCalculator(c);
    if (calculatedActivity !== 0) {
      if (!stakeholders.has(c.stakeholder.id)) {
        stakeholders.set(c.stakeholder.id, {
          id: c.stakeholder.id,
          signature: c.stakeholder.gitSignature,
          name: c.stakeholder.id,
          activity: 0
        });
      }
      const dateString = c.date.substring(0, 10);

      const dateParsed = Date.parse(c.date);
      if (!activities.has(dateString)) {
        activities.set(dateString, {
          date: dateParsed,
          activity: 0
        });
      }

      const stakeholder = stakeholders.get(c.stakeholder.id);
      stakeholder.activity += calculatedActivity;

      const current = activities.get(dateString);
      current.activity += calculatedActivity;
      updateBoundaries(dataBoundaries, current.activity);
    }
  });

  return {
    stakeholders: Array.from(stakeholders.values()),
    activityTimeline: Array.from(activities.values()),
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

/**
 * @param from {number}
 * @param to {number}
 * @param fn {function}
 * @return {function(*): number}
 */
function filterCommitOnDate(from, to, fn) {
  return commit => {
    const parsedDate = Date.parse(commit.date);
    if (from <= parsedDate && parsedDate <= to) {
      return fn(commit);
    }
    return 0;
  };
}

/**
 * @param selectedBranch {string}
 * @param fn {function}
 * @return {function(*): number}
 */
function filterCommitOnBranch(selectedBranch, fn) {
  return commit => {
    if (commit.branch === selectedBranch) {
      return fn(commit);
    }
    return 0;
  };
}

function selectCalculationFunction(config) {
  const { selectedActivityScale } = config;
  if (!selectedActivityScale) {
    return () => 1;
  }

  switch (selectedActivityScale) {
    case 'activity':
      return commit => commit.stats.additions + commit.stats.deletions;
    case 'additions':
      return commit => commit.stats.additions;
    case 'deletions':
      return commit => commit.stats.deletions;
    default:
      // Also covers 'commits'
      return () => 1;
  }
}
