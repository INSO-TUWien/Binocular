'use strict';

const Promise = require('bluebird');
const SimianCloneIndexer = require('./SimianCloneIndexer.js');
const config = require('../../config.js');
const ConfigurationError = require('../../errors/ConfigurationError.js');
const possibleTools = ['Simian', 'CPD'];

module.exports = function() {
  return Promise.try(() => {
    const cloneDetectionTool = config.get('clonedetection');

    // check for mandatory config parameters
    if (!cloneDetectionTool) {
      // no clone detection specified -> will not be indexed
      return;
    }

    if (!cloneDetectionTool.clonesenabled) {
      throw new ConfigurationError('Please specify true/false for property clonesenabled.');
    }

    if (!cloneDetectionTool.toolexec) {
      throw new ConfigurationError('Please specify a clone detector (toolexec).');
    }

    if (!cloneDetectionTool.clonedir) {
      throw new ConfigurationError('Please specify a clonedir.');
    }

    if (!cloneDetectionTool.revfile) {
      throw new ConfigurationError(
        'Please specify a location for the file containing list of revisions. (revfile).'
      );
    }

    if (cloneDetectionTool.name.localeCompare(possibleTools[0] == 0)) {
      return Promise.try(() => {
        const idx = new SimianCloneIndexer(...arguments);
        idx.configure(cloneDetectionTool);
        return idx;
      });
    } else if (cloneDetectionTool.name.localeCompare(possibleTools[0] == 0)) {
      throw new Error('CPD Clone Detection not yet implemented!');
    } else {
      throw new Error('No valid Clone Detection Tool specified!');
    }
  });
};
