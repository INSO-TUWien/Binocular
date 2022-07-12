'use strict';

import visualizationRegistry from '../visualizationRegistry';
import { createAction } from 'redux-actions';

export const setResolution = createAction('SET_RESOLUTION');

export default function* () {
  for (const visualization in visualizationRegistry) {
    let viz = visualizationRegistry[visualization];
    if (viz.saga !== undefined) {
      yield* viz.saga();
    }
  }
}
