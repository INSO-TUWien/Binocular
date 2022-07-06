'use strict';

import visualizationRegistry from '../visualizationRegistry';

export default function* () {
  for (const visualization in visualizationRegistry) {
    let viz = visualizationRegistry[visualization];
    if (viz.saga !== undefined) {
      yield* viz.saga();
    }
  }
}
