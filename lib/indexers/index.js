'use strict';

import vcs from './vcs/index';
import its from './its/index';
import ci from './ci/index';

export function makeVCSIndexer(repository, urlProvider, progressReporter, clean, config, context) {
  return vcs(repository, urlProvider, progressReporter, clean, config, context);
}

export function makeITSIndexer(repository, progressReporter, context, clean) {
  return its(repository, progressReporter, context, clean);
}

export function makeCIIndexer(repository, progressReporter, context, clean) {
  return ci(repository, progressReporter, context, clean);
}
