'use strict';

const joinUrl = require('url-join');
const ConfigurationError = require('../errors/ConfigurationError.js');

class GitHubUrlProvider {
  constructor(repo) {
    this.repo = repo;
  }

  configure(config) {
    this.baseUrl = config.url;
    this.project = config.project;

    if (!this.baseUrl || !this.project) {
      return this.repo.getOriginUrl().then(url => {
        if (!this.baseUrl) {
          this.baseUrl = 'https://github.com/';
        }

        if (!this.project) {
          const match = url.match(/^.*[:\/](.+\/.+)\.git$/);
          if (match) {
            this.project = match[1];
          } else {
            throw new ConfigurationError(
              'Unable to auto-detect project from git configuration, please specify "project" in the config'
            );
          }
        }
      });
    }
  }

  getCommitUrl(sha) {
    return joinUrl(this.baseUrl, this.project, 'commit', sha);
  }

  getFileUrl(sha, path) {
    return joinUrl(this.baseUrl, this.project, 'blob', sha, path);
  }

  getPipelineUrl(/*id*/) {
    throw new Error('Not yet implemented!');
  }

  getJobUrl(/*id*/) {
    throw new Error('Not yet implemented!');
  }

  getHunkUrl(sha, path, lineStart, length) {
    return this.getFileUrl(sha, path + `#L${lineStart}-${lineStart + length}`);
  }
}

module.exports = GitHubUrlProvider;
