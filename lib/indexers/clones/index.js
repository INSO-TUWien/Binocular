'use strict';

const Promise = require('bluebird');
const SimianCloneIndexer = require('./SimianCloneIndexer.js');
const config = require('../../config.js');
const possibleTools = ['Simian', 'CPD'];

module.exports = function() {
  return Promise.try(() => {
    const cloneDetectionTool = config.get('clonedetection');

    if (cloneDetectionTool && cloneDetectionTool.name.localeCompare(possibleTools[0] == 0)) {
      return Promise.try(() => {
        const idx = new SimianCloneIndexer(...arguments);
        idx.configure(cloneDetectionTool);
        return idx;
      });
    } else if (cloneDetectionTool && cloneDetectionTool.name.localeCompare(possibleTools[0] == 0)) {
      throw new Error('CPD Clone Detection not yet implemented!');
    } else {
      throw new Error('No valid Clone Detection Tool specified!');
    }
  });
};
