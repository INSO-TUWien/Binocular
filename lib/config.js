'use strict';

const fs = require('fs-extra-promise');
const watchdog = require('fs');
const _ = require('lodash');
const log = require('debug')('config');

const packageJson = require('../package.json');

const watchers = [];

let stopped = false;
let config = loadConfig();
let source;

module.exports = {
  get: function (key, defaultValue) {
    if (!key) {
      return config;
    } else {
      return _.get(config, key, defaultValue);
    }
  },

  update: function (newConfig) {
    const data = _.pick(newConfig, 'port', 'gitlab', 'arango');

    log('Writing new config to %o %o', source, newConfig);
    return fs
      .writeJsonAsync(source, data, { spaces: 2 })
      .then(function () {
        delete require.cache.rc;

        log('Reloading config');
        config = loadConfig();
      })
      .then(function () {
        log('Broadcasting config update');
        return emit('updated', config).catch((e) => console.error(e));
      })
      .then(function () {
        log('Configuration update complete');
        return config;
      });
  },

  ensure: function (key, value) {
    if (!_.has(config, key)) {
      _.set(config, key, value);
    }
  },

  on: function (eventName, handler) {
    listeners[eventName] = listeners[eventName] || [];
    listeners[eventName].push(handler);
  },

  setSource: function (newSource) {
    source = newSource;
  },

  isStopping: () => stopped,

  stop: () => {
    if (stopped) {
      return;
    }
    delete require.cache.rc;
    config = {};
    stopped = true;
    // clear watchers
    watchers.forEach((watcher) => watcher.close());
    watchers.length = 0;
  },
};

function emit(eventName) {
  const args = [].slice.call(arguments, 1);

  return Promise.map(listeners[eventName] || [], (handler) => handler(...args));
}

function loadConfig() {
  // clear watchers
  watchers.forEach((watcher) => watcher.close());
  watchers.length = 0;
  const ctx = require('./context.js');

  const cwd = process.cwd();
  process.chdir(ctx.targetPath);
  const configuration = require('rc')('binocular', {
    port: 48763,
    arango: {
      host: 'localhost',
      port: 8529,
    },
    travis: {},
    gateway: {
      address: '127.0.0.1',
      port: 48764,
      token: 'B1nocul4r!',
    },
  });
  const configFiles = configuration.configs ? configuration.configs : [];

  // set watchdog to update config dynamically
  configFiles.forEach((configFile) => watchers.push(watchdog.watch(configFile, () => emit('updated', (config = loadConfig())))));

  if (configFiles.length < 1) {
    console.warn(`No ".binocularrc" could be found in the home folder or in the following path "${process.cwd()}"!`);
  }
  process.chdir(cwd);
  stopped = false;

  return configuration;
}

const listeners = {};
