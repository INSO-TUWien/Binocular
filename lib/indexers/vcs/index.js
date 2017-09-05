'use strict';

const GitIndexer = require('./GitIndexer.js');

module.exports = function() {
  return new GitIndexer(...arguments);
};
