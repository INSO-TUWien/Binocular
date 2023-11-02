'use strict';

const vcs = require('./vcs');
const its = require('./its');
const ci = require('./ci');

module.exports = {
  makeVCSIndexer: function (repository, progressReporter, clear) {
    return vcs(repository, progressReporter, clear);
  },

  makeITSIndexer: function (repository, progressReporter, context, clear) {
    return its(repository, progressReporter, context, clear);
  },

  makeCIIndexer: function (repository, progressReporter, context, clear) {
    return ci(repository, progressReporter, context, clear);
  },
};
