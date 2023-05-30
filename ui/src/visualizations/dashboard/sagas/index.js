'use strict';

import visualizationRegistry from '../visualizationRegistry';
import { createAction } from 'redux-actions';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils';
import Database from '../../../database/database.js';
import { getChartColors } from '../../../utils';

export default function* () {
  for (const visualization in visualizationRegistry) {
    const viz = visualizationRegistry[visualization];
    if (viz.saga !== undefined) {
      yield* viz.saga();
    }
  }
}
