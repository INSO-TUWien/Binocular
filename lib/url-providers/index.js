'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const config = require('../config.js');
const IllegalArgumentError = require('../errors/IllegalArgumentError.js');
const log = require('debug')('url-provider');

const GitLabUrlProvider = require('./GitLabUrlProvider.js');
const GitHubUrlProvider = require('./GitHubUrlProvider.js');

module.exports = function(repo) {
  let type = _.toLower(config.get('indexers.its', 'auto'));

  return Promise.try(() => {
    if (type === 'auto') {
      return detectProvider(repo);
    } else {
      return type;
    }
  })
    .then(type => {
      switch (type) {
        case 'gitlab':
          return [new GitLabUrlProvider(...arguments), config.get(type)];
        case 'github':
          return [new GitHubUrlProvider(...arguments), config.get(type)];
        default:
          throw new IllegalArgumentError(`ITS indexer ${type} is not (yet) available`);
      }
    })
    .spread(function(provider, config) {
      return Promise.try(() => provider.configure(config)).thenReturn(provider);
    });
};

function detectProvider(repo) {
  log('Detecting URL-provider from origin url...');
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
