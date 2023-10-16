'use strict';

import _ from 'lodash';
import * as inflection from 'inflection';
import debug from 'debug';

const log = debug('progress-reporter');

/**
 * Used to track progress of indexing operations.
 * Keeps an array of commits that is currently being processed at all times, sorted by commit date.
 * Before starting, the total number of commits must be set by calling `setCommitCount`.
 */
function ProgressReporter(io, categories) {
  this.dirty = true;
  this.categories = {};

  _.each(categories, (categories) => {
    const Category = _.upperFirst(inflection.singularize(categories));

    this.categories[categories] = {
      processed: 0,
      total: 0,
    };

    this[`set${Category}Count`] = function (n) {
      log(`Set ${Category}Count: %d`, n);
      this.categories[categories].total = n;
      this.categories[categories].processed = 0;
      this.dirty = true;
    };

    this[`finish${Category}`] = function () {
      log(`finish${Category}`);
      this.categories[categories].processed++;
      this.report();
    };
  });

  this.sockets = [];

  io.on('connection', (socket) => {
    log('Client connected');
    this.sockets.push(socket);

    socket.on('disconnect', () => {
      log('Client disconnected');
      _.pull(this.sockets, socket);
    });

    this.report();
  });
}

ProgressReporter.prototype.report = _.throttle(function () {
  const report = this.getProgressReport();
  log('Report: %o', report);
  _.each(this.sockets, (socket) => socket.emit('action', { type: 'PROGRESS', report }));
}, 100);

ProgressReporter.prototype.getProgressReport = function () {
  if (!this.dirty) {
    return this.lastProgressReport;
  }

  this.lastProgressReport = _.cloneDeep(this.categories);
  return this.lastProgressReport;
};

export default ProgressReporter;
