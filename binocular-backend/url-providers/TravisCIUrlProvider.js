'use strict';

import joinUrl from 'url-join';
import BaseGitProvider from './BaseGitProvider.js';

class TravisCIUrlProvider extends BaseGitProvider {
  constructor(repo) {
    super(repo, /^.*[:/](.+\/.+?)(\.git)?$/, 'travis-ci.org', 'travis-ci');
  }

  setBaseUrl(url) {
    if (!this.baseUrl || this.baseUrl.length < 1) {
      this.baseUrl = url;
    }

    const match = this.baseUrl.match(/^(?:https?:\/\/)?.*?(travis-ci\.[^/]*).*$/);
    if (match) {
      this.baseUrl = `${match[1]}`;
    } else {
      this.baseUrl = this.defaultURI;
    }
  }

  getPipelineUrl(id) {
    return joinUrl('https://', this.baseUrl, this.context.vcsUrlProvider.getProvider(), this.project, 'builds', String(id));
  }

  getJobUrl(id) {
    return joinUrl('https://', this.baseUrl, this.context.vcsUrlProvider.getProvider(), this.project, 'jobs', String(id));
  }

  getApiUrl() {
    return joinUrl('https://api.' + this.baseUrl);
  }

  getProjectName() {
    return this.project;
  }
}

export default TravisCIUrlProvider;
