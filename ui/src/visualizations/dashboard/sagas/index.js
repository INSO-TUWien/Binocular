'use strict';

import visualizationRegistry from '../visualizationRegistry';
import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import getBounds from '../../VisualizationComponents/changes/sagas/getBounds';

export const setResolution = createAction('SET_RESOLUTION');
export const setTimeSpan = createAction('SET_TIME_SPAN');

export const requestDashboardData = createAction('REQUEST_DASHBOARD_DATA');
export const receiveDashboardData = timestampedActionFactory('RECEIVE_DASHBOARD_DATA');
export const receiveDashboardDataError = createAction('RECEIVE_DASHBOARD_DATA_ERROR');

export default function* () {
  for (const visualization in visualizationRegistry) {
    const viz = visualizationRegistry[visualization];
    if (viz.saga !== undefined) {
      yield* viz.saga();
    }
  }
  yield* fetchDashboardData();
}

export const fetchDashboardData = fetchFactory(
  function* () {
    const { firstCommit, lastCommit, committers, firstIssue, lastIssue } = yield getBounds();
    return {
      firstCommit,
      lastCommit,
      firstIssue,
      lastIssue,
    };
  },
  requestDashboardData,
  receiveDashboardData,
  receiveDashboardDataError
);
