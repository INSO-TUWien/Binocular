'use strict';

const log = require('debug')('idx:clones');

class BaseCloneIndexer {
  constructor(repo, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config) {
    this.project = config.project;
    this.repo_path = this.repo.path.substr(0, this.repo.path.length - 5);

    if (!this.project) {
      var splitted = this.repo_path.replace('\\', '/').split('/');
      this.project = splitted[splitted.length - 2];
    }

    if (this.project.includes('/')) {
      var match = this.project.split('/');
      this.project = match[match.length - 1];
    }

    this.toolexec = config.toolexec;
  }

  stop() {
    log('Stopping');
    this.stopping = true;
  }
}

module.exports = BaseCloneIndexer;
