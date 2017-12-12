'use strict';

// const _ = require('lodash');
// const { URL } = require('url');

class GitHubUrlProvider {
  constructor() {}

  configure(config) {
    this.baseUrl = config.url;
  }

  getCommitUrl(/*sha*/) {
    throw new Error('Not yet implemented!');
  }

  getFileUrl(/*sha, path*/) {
    throw new Error('Not yet implemented!');
  }

  getPipelineUrl(/*id*/) {
    throw new Error('Not yet implemented!');
  }

  getJobUrl(/*id*/) {
    throw new Error('Not yet implemented!');
  }
}

module.exports = GitHubUrlProvider;
