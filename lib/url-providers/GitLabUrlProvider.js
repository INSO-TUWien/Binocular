'use strict';

const joinUrl = require('url-join');
const BaseGitProvider = require('./BaseGitProvider');

class GitLabUrlProvider extends BaseGitProvider {
  constructor(repo) {
    super(repo, /^.*[:\/](.+\/.+)\.git$/, 'https://reset.inso.tuwien.ac.at/repo/', 'gitlab');
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
}

module.exports = GitLabUrlProvider;
