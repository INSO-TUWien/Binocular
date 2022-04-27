'use strict';

import { put, select } from 'redux-saga/effects';
import { processTeamAwarenessData } from './index';
import { getState } from '../util/util';
import _ from 'lodash';

export default function*() {
  const appState = yield select();
  yield put(processTeamAwarenessData(processData(appState)));
}

function processData(appState) {
  const { config, data } = getState(appState);

  /** @type {Map<number, any>} */
  const stakeholders = new Map();

  /** @type {Map<string, any>} */
  const activities = new Map();

  const dataBoundaries = {
    min: 0,
    max: Number.MIN_SAFE_INTEGER
  };

  let activityCalculator = filterCommitOnFiles(config.fileFilter, selectCalculationFunction(config));
  if (config.activityRestricted === true) {
    const from = Date.parse(config.activityDims[0]);
    const to = Date.parse(config.activityDims[1]);
    activityCalculator = filterCommitOnDate(from, to, activityCalculator);
  }

  if (config.selectedBranch && config.selectedBranch !== 'all') {
    activityCalculator = filterCommitOnBranch(config.selectedBranch, activityCalculator);
  }

  data.data.commits.forEach(c => {
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

/**
 * @param filter
 * @param fn {function}
 * @return {function(*): number}
 */
function filterCommitOnFiles(filter, fn) {
  const filteredCommits = _.reduce(
    filter.files,
    (acc, f) => {
      _.map(f.commits.data, 'sha').forEach(s => acc.add(s));
      return acc;
    },
    new Set()
  );

  let excludeFilesFn = sha => !filteredCommits.has(sha);
  if (filter.mode === 'INCLUDE') {
    excludeFilesFn = sha => filteredCommits.has(sha);
  }

  return commit => (excludeFilesFn(commit.sha) ? fn(commit) : 0);
}

function selectCalculationFunction(config) {
  const { selectedActivityScale } = config;
  if (!selectedActivityScale) {
    return () => 1;
  }

  switch (selectedActivityScale) {
    case 'activity':
      return commit => commit.stats.additions - commit.stats.deletions;
    case 'additions':
      return commit => commit.stats.additions;
    case 'deletions':
      return commit => commit.stats.deletions;
    default:
      // Also covers 'commits'
      return () => 1;
  }
}
