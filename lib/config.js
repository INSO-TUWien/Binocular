'use strict';

const fs = require('fs-extra-promise');
const _ = require('lodash');
const Promise = require('bluebird');
const log = require('debug')('config');

const packageJson = require('../package.json');

let config = loadConfig();
let source;

module.exports = {
  get: function(key, defaultValue) {
    if (!key) {
      return config;
    } else {
      return _.get(config, key, defaultValue);
    }
  },

  update: function(newConfig) {
    const data = _.pick(newConfig, 'port', 'gitlab', 'arango');

    log('Writing new config to %o %o', source, newConfig);
    return fs
      .writeJsonAsync(source, data, { spaces: 2 })
      .then(function() {
        delete require.cache.rc;

        log('Reloading config');
        config = loadConfig();
      })
      .then(function() {
        log('Broadcasting config update');
        return emit('updated', config).catch(e => console.error(e));
      })
      .then(function() {
        log('Configuration update complete');
        return config;
      });
  },

  ensure: function(key, value) {
    if (!_.has(config, key)) {
      _.set(config, key, value);
    }
  },

  on: function(eventName, handler) {
    listeners[eventName] = listeners[eventName] || [];
    listeners[eventName].push(handler);
  },

  setSource: function(newSource) {
    source = newSource;
  }
};

function emit(eventName) {
  const args = [].slice.call(arguments, 1);

  return Promise.map(listeners[eventName] || [], handler => handler(...args));
}

function loadConfig() {
  const ctx = require('./context.js');

  const cwd = process.cwd();
  process.chdir(ctx.targetPath);
  const config = require('rc')(packageJson.name, {
    port: 48763,
    arango: {
      host: 'localhost',
      port: 8529
    }
  });
  process.chdir(cwd);

  return config;
}

const listeners = {};
