const ConfigurationError = require('../errors/ConfigurationError.js');
const joinUrl = require('url-join');

class BaseGitProvider {
  constructor(repo, projectRegex, defaultURI) {
    this.repo = repo;
    this.projectRegex = projectRegex;
    this.defaultURI = defaultURI;
  }

  async configure(config) {
    this.baseUrl = config.url;
    this.project = config.project;

    if (this.baseUrl && this.project) {
      return;
    }

    const origin = await this.repo.getOriginUrl();
    if (!this.baseUrl) {
      this.setBaseUrl(this.defaultURI);
    }

    if (!this.project) {
      const match = origin.match(this.projectRegex);
      if (match) {
        this.project = match[1];
      } else {
        throw new ConfigurationError('Unable to auto-detect project from git configuration, please specify "project" in the config');
      }
    }
  }

  setBaseUrl(url) {
    if (!this.baseUrl || this.baseUrl.length < 1) {
      this.baseUrl = url;
    }
  }

  getCommitUrl(sha) {
    return joinUrl(this.baseUrl, this.project, 'commit', sha);
  }

  getFileUrl(sha, path) {
    return joinUrl(this.baseUrl, this.project, 'blob', sha, path);
  }

  // eslint-disable-next-line no-unused-vars
  getPipelineUrl(_id) {
    throw new Error('Not yet implemented!');
  }

  // eslint-disable-next-line no-unused-vars
  getJobUrl(_id) {
    throw new Error('Not yet implemented!');
  }

  getHunkUrl(sha, path, lineStart, length) {
    return this.getFileUrl(sha, path + `#L${lineStart}-${lineStart + length}`);
  }

  getApiUrl() {
    throw new Error('Not yet implemented!');
  }
}

module.exports = BaseGitProvider;
