'use strict';

const log = require('debug')('idx:git');

const Commit = require('../models/Commit.js');
const File = require('../models/File.js');

function LocalIndexer(repo, reporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

LocalIndexer.prototype.index = function() {
  let omitCount = 0;
  let persistCount = 0;

  let total = 0;

  return this.repo.walk(() => total++).then(() => {
    this.reporter.setCommitCount(total);
    log('Processing', total, 'commits');

    return this.repo
      .walk(commit => {
        if (this.stopping) {
          return;
        }

        return Commit.persist(commit).bind(this).spread(function(c, wasCreated) {
          if (wasCreated) {
            persistCount++;
          } else {
            omitCount++;
          }

          this.reporter.finishCommit();

          log(`${omitCount + persistCount}/${total} commits processed`);
          log(`${omitCount + persistCount}/${total} commits processed`);
        });
      }, null)
      .tap(function() {
        log('Persisted %d new commits (%d already present)', persistCount, omitCount);

        log('Deducing file lengths...');
        return File.deduceMaxLengths();
      })
      .then(() => log('Done'));
  });
};

LocalIndexer.prototype.stop = function() {
  log('Stopping');
  this.stopping = true;
};

module.exports = LocalIndexer;
