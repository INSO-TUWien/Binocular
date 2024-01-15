import ConfigurationError from '../errors/ConfigurationError.js';
import joinUrl from 'url-join';

class BaseGitProvider {
  constructor(repo, projectRegex, defaultURI, provider) {
    this.repo = repo;
    this.projectRegex = projectRegex;
    this.defaultURI = defaultURI;
    this.provider = provider;
  }

  async configure(config, context) {
    this.baseUrl = config.url;
    this.project = config.project;
    this.context = context;

    if (this.baseUrl && this.project) {
      return;
    }

    const origin = await this.repo.getOriginUrl();
    this.setBaseUrl(this.defaultURI);

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

  getProvider() {
    return this.provider;
  }

  getCommitUrl(sha) {
    return joinUrl(this.baseUrl, this.project, 'commit', sha);
  }

  getFileUrl(sha, path) {
    return joinUrl(this.baseUrl, this.project, 'blob', sha, path);
  }

  getDirUrl(sha, path) {
    return joinUrl(this.baseUrl, this.project, 'tree', sha, path);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPipelineUrl(_id) {
    throw new Error('Not yet implemented!');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export default BaseGitProvider;
