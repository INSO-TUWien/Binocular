'use strict';

import BaseGitProvider from './BaseGitProvider.js';

class GitHubUrlProvider extends BaseGitProvider {
  constructor(repo) {
    super(repo, /^.*[:/](.+\/.+?)(?:\.git)?$/, 'https://github.com/', 'github');
  }
}

export default GitHubUrlProvider;
