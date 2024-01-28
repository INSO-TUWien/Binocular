'use strict';

import GitLabMock from './gitLabMock.js';

class GitLabBaseIndexerMock {
  constructor(repo, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;

    this.urlProvider = {
      getJobUrl: (id) => 'https://gitlab.com/Test/Test-Project/jobs/' + id,
      getPipelineUrl: (id) => 'https://gitlab.com/Test/Test-Project/pipelines/' + id,
    };
  }

  setupUrlProvider() {
    this.urlProvider = {
      getJobUrl: (id) => 'https://gitlab.com/Test/Test-Project/jobs/' + id,
      getPipelineUrl: (id) => 'https://gitlab.com/Test/Test-Project/pipelines/' + id,
    };
    this.setupGitlab();
  }

  setupGitlab() {
    this.gitlab = new GitLabMock();
  }

  getProject() {
    return new GitLabMock().getProject();
  }

  stop() {
    this.stopping = true;
  }

  isStopping() {
    return this.stopping;
  }
}

export default GitLabBaseIndexerMock;
