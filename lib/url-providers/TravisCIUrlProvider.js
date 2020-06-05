'use strict';

const joinUrl = require('url-join');
const BaseGitProvider = require('./BaseGitProvider');

class TravisCIUrlProvider extends BaseGitProvider {
  constructor(repo) {
    super(repo, /^.*[:\/](.+\/.+?)(\.git)?$/, 'https://api.travis-ci.org/');
  }

  getPipelineUrl(id) {
    return joinUrl(this.baseUrl, this.project, 'builds', id);
  }

  getJobUrl(id) {
    return joinUrl(this.baseUrl, this.project, '-', 'jobs', id);
  }

  getApiUrl() {
    return joinUrl(this.baseUrl);
  }

  getProjectName() {
    return this.project;
  }
}

module.exports = TravisCIUrlProvider;
