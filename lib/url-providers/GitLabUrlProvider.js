'use strict';

import joinUrl from 'url-join';
import BaseGitProvider from './BaseGitProvider.js';

class GitLabUrlProvider extends BaseGitProvider {
  constructor(repo) {
    const config = require('../config.js');
    console.log(config.get('gitlab').url);
    super(repo, /^.*[:/](.+\/.+)\.git$/, config.get('gitlab').url, 'gitlab');
  }

  setBaseUrl(url) {
    if (this.baseUrl && this.baseUrl.length > 0) {
      return;
    }
    const match = url.match(/git@(.*):(.*)\/(.*)\.git/);
    if (match) {
      this.baseUrl = `https://${match[1]}/`;
    } else {
      this.baseUrl = this.defaultURI;
    }
  }

  getPipelineUrl(id) {
    return joinUrl(this.baseUrl, this.project, 'pipelines', id);
  }

  getJobUrl(id) {
    return joinUrl(this.baseUrl, this.project, '-', 'jobs', id);
  }

  getApiUrl() {
    return joinUrl(this.defaultURI, 'api', 'v4');
  }

  getBaseAPIUrl() {
    return joinUrl(this.defaultURI, 'api');
  }
}

export default GitLabUrlProvider;
