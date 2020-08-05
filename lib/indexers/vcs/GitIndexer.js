'use strict';

const log = require('debug')('idx:vcs:git');

const Commit = require('../../models/Commit.js');
const File = require('../../models/File.js');

class GitIndexer {
  constructor(repo, urlProvider, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.urlProvider = urlProvider;
    this.reporter = reporter;
  }

  index() {
    let omitCount = 0;
    let persistCount = 0;

    let total = 0;

    log('Counting commits...');

    return this.repo.walk(() => total++).then(() => {
      if ('setCommitCount' in this.reporter && typeof this.reporter.setCommitCount === 'function') {
        this.reporter.setCommitCount(total);
      }
      log('Processing', total, 'commits');

      return this.repo
        .walk(commit => {
          if (this.stopping) {
            return;
          }

          return Commit.persist(this.repo, commit, this.urlProvider).spread((commitDAO, wasCreated) => {
            if (!commitDAO) {
              return;
            }

            if (wasCreated) {
              persistCount++;
            } else {
              omitCount++;
            }
            return commitDAO.processLanguage(this.repo, commit).tap(() => {
              if ('finishCommit' in this.reporter && typeof this.reporter.finishCommit === 'function') {
                this.reporter.finishCommit();
              }

              log(`${omitCount + persistCount}/${total} commits processed`);
            });
          });
        }, null)
        .tap(function() {
          log('Persisted %d new commits (%d already present)', persistCount, omitCount);

          log('Deducing file lengths...');
          return File.deduceMaxLengths();
        })
        .then(() => log('Done'));
    });
  }

  stop() {
    log('Stopping');
    this.stopping = true;
  }

  isStopping() {
    return this.stopping;
  }
}

module.exports = GitIndexer;
