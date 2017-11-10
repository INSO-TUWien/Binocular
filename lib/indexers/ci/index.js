'use strict';

const Promise = require('bluebird');
const GitLabCIIndexer = require('./GitLabCIIndexer.js');
const config = require('../../config.js');

module.exports = function() {
  return Promise.try(() => {
    const idx = new GitLabCIIndexer(...arguments);
    idx.configure(config.get('gitlab'));
    return idx;
  });
};
