'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const config = require('../../config.js');
const IllegalArgumentError = require('../../errors/IllegalArgumentError.js');
const log = require('debug')('idx:its');

const GitLabITSIndexer = require('./GitLabITSIndexer.js');
const GitHubIndexer = require('./GitHubIndexer.js');

module.exports = function(repo) {
  let type = _.toLower(config.get('indexers.its', 'auto'));

  return Promise.try(() => {
    if (type === 'auto') {
      return detectIndexer(repo);
    } else {
      return type;
    }
  })
    .then(type => {
      switch (type) {
        case 'gitlab':
          return [new GitLabITSIndexer(...arguments), config.get(type)];
        case 'github':
          return [new GitHubIndexer(...arguments), config.get(type)];
        default:
          throw new IllegalArgumentError(`ITS indexer ${type} is not (yet) available`);
      }
    })
    .spread(function(idx, config) {
      return idx.configure(config).thenReturn(idx);
    });
};

function detectIndexer(repo) {
  log('Detecting ITS indexer from origin url...');
  return repo.getOriginUrl().then(function(url) {
    if (url.match(/gitlab/i)) {
      return 'gitlab';
    } else if (url.match(/github.com/i)) {
      return 'github';
    } else {
      throw new IllegalArgumentError('Unable to auto-detect ITS. Please configure it manually');
    }
  });
}
