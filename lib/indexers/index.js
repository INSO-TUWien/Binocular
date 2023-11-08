'use strict';

import vcs from './vcs/index.js';
import its from './its/index.js';
import ci from './ci/index.js';

export function makeVCSIndexer(repository, urlProvider, progressReporter, clear) {
  return vcs(repository, urlProvider, progressReporter, clear);
}

export function makeITSIndexer(repository, progressReporter, context, clear) {
  return its(repository, progressReporter, context, clear);
}

export function makeCIIndexer(repository, progressReporter, context, clear) {
  return ci(repository, progressReporter, context, clear);
}
