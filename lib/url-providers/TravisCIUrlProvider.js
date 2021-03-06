'use strict';

const joinUrl = require('url-join');
const BaseGitProvider = require('./BaseGitProvider');

class TravisCIUrlProvider extends BaseGitProvider {
  constructor(repo) {
    super(repo, /^.*[:\/](.+\/.+?)(\.git)?$/, 'travis-ci.org', 'travis-ci');
  }

  setBaseUrl(url) {
    if (!this.baseUrl || this.baseUrl.length < 1) {
      this.baseUrl = url;
    }

    const match = this.baseUrl.match(/^(?:https?:\/\/)?.*?(travis-ci\.[^\/]*).*$/);
    if (match) {
      this.baseUrl = `${match[1]}`;
    } else {
      this.baseUrl = this.defaultURI;
    }
  }

  getPipelineUrl(id) {
    return joinUrl('https://', this.baseUrl, this.context.vcsUrlProvider.getProvider(), this.project, 'builds', id);
  }

  getJobUrl(id) {
    return joinUrl('https://', this.baseUrl, this.context.vcsUrlProvider.getProvider(), this.project, 'jobs', id);
  }

  getApiUrl() {
    return joinUrl('https://api.' + this.baseUrl);
  }

  getProjectName() {
    return this.project;
  }
}

module.exports = TravisCIUrlProvider;
