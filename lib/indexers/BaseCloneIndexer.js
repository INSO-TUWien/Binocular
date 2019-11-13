'use strict';

const LastRevision = require('../models/LastRevision.js');
const log = require('debug')('idx:clones');

class BaseCloneIndexer {
  constructor(repo, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config) {
    this.project = config.project;
    this.repoPath = this.repo.path.substr(0, this.repo.path.length - 5);

    if (!this.project) {
      var splitted = this.repoPath.replace('\\', '/').split('/');
      this.project = splitted[splitted.length - 2];
    }

    if (this.project.includes('/')) {
      var match = this.project.split('/');
      this.project = match[match.length - 1];
    }

    this.toolexec = config.toolexec;

    const lastRevisionId = 'lastrevision';
    LastRevision.findById(lastRevisionId).then(function(instance) {
      if (!instance) {
        log('Processing', lastRevisionId);
        LastRevision.create({
          id: lastRevisionId,
          sha: 'UNDEFINED'
        });
      }
    });
  }

  stop() {
    log('Stopping');
    this.stopping = true;
  }
}

module.exports = BaseCloneIndexer;
