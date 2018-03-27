'use strict';

const vcs = require('./vcs');
const its = require('./its');
const ci = require('./ci');

module.exports = {
  makeVCSIndexer: function(repository, progressReporter) {
    return vcs(repository, progressReporter);
  },

  makeITSIndexer: function(repository, progressReporter) {
    return its(repository, progressReporter);
  },

  makeCIIndexer: function(repository, progressReporter) {
    return ci(repository, progressReporter);
  }
};
