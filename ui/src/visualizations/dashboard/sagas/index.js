'use strict';

import visualizationRegistry from '../visualizationRegistry';
import { createAction } from 'redux-actions';
import { select } from 'redux-saga/effects';

export const setActiveVisualizations = createAction('SET_ACTIVE_VISUALIZATIONS');

export default function* () {
  const state = yield select();
  for (const visualization of state.visualizations.newDashboard.state.config.visualizations) {
    const viz = visualizationRegistry[visualization];
    if (viz.saga !== undefined) {
      yield* viz.saga();
    }
  }
}
