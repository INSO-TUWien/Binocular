'use strict';

const BaseGitProvider = require('./BaseGitProvider');

class GitHubUrlProvider extends BaseGitProvider {
  constructor(repo) {
    super(repo, /^.*[:\/](.+\/.+)$/, 'https://github.com/', 'github');
  }
}

module.exports = GitHubUrlProvider;
