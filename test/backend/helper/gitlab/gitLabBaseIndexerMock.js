'use strict';

const GitLabMock = require('./gitLabMock');
class GitLabBaseIndexerMock {
  constructor(repo, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config) {
    this.gitlab = new GitLabMock();

    this.gitlabProject = config.project;
  }

  getProject() {
    return this.gitlab.getProject();
  }

  stop() {
    this.stopping = true;
  }

  isStopping() {
    return this.stopping;
  }
}

module.exports = GitLabBaseIndexerMock;
