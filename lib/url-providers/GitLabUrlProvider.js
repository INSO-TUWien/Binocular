'use strict';

const joinUrl = require('url-join');

class GitLabUrlProvider {
  constructor() {}

  configure(config) {
    this.baseUrl = config.url;
    this.project = config.project;
  }

  getCommitUrl(sha) {
    return joinUrl(this.baseUrl, this.project, 'commit', sha);
  }

  getFileUrl(sha, path) {
    return joinUrl(this.baseUrl, this.project, 'blob', sha, path);
  }

  getPipelineUrl(id) {
    return joinUrl(this.baseUrl, this.project, 'pipelines', id);
  }

  getJobUrl(id) {
    return joinUrl(this.baseUrl, this.project, '-', 'jobs', id);
  }

  getHunkUrl(sha, path, lineStart, length) {
    return this.getFileUrl(sha, path + `#L${lineStart}-${lineStart + length}`);
  }
}

module.exports = GitLabUrlProvider;
