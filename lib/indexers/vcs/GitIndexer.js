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

  setGateway(gatewayService) {
    this.gateway = gatewayService;
  }

  index() {
    this.stopping = false;
    const commitCounter = {
      omitCount: 0,
      persistCount: 0
    };

    const languageCounter = {
      omitCount: 0,
      persistCount: 0
    };

    let total = 0;

    log('Counting commits...');

    return this.repo.walk(() => total++).then(() => {
      if ('setCommitCount' in this.reporter && typeof this.reporter.setCommitCount === 'function') {
        this.reporter.setCommitCount(total);
      }
      if ('setLanguageCount' in this.reporter && typeof this.reporter.setLanguageCount === 'function') {
        this.reporter.setLanguageCount(total);
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
              commitCounter.persistCount++;
            } else {
              commitCounter.omitCount++;
            }

            return commitDAO.processLanguage(this.repo, commit, this.gateway).spread((enabled, isCreated) => {
              if ('finishCommit' in this.reporter && typeof this.reporter.finishCommit === 'function') {
                this.reporter.finishCommit();
              }

              log(`${commitCounter.omitCount + commitCounter.persistCount}/${total} commits processed`);

              if (!enabled) {
                return;
              }

              if (isCreated) {
                languageCounter.persistCount++;
              } else {
                languageCounter.omitCount++;
              }

              if ('finishLanguage' in this.reporter && typeof this.reporter.finishLanguage === 'function') {
                this.reporter.finishLanguage();
              }

              log(`${languageCounter.omitCount + languageCounter.persistCount}/${total} languages for commit processed`);
            });
          });
        }, null)
        .tap(function() {
          log('Persisted %d new commits (%d already present)', commitCounter.persistCount, commitCounter.omitCount);
          log(
            'Persisted %d new language processing of commits (%d already present)',
            languageCounter.persistCount,
            languageCounter.omitCount
          );

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
