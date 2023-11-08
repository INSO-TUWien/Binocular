'use strict';

import GitLab from '../core/provider/gitlab.js';
import debug from 'debug';
import { getVcsUrlProvider as getUrlProvider } from '../url-providers/index.js';
import ConfigurationError from '../errors/ConfigurationError.js';

const log = debug('idx:gitlab');

const GITLAB_URL_REGEX = /[/:]([^/]+)\/([^/]+)\.git/;

class BaseGitLabIndexer {
  constructor(repo, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config) {
    return this.setupUrlProvider(this.repo, config);
  }

  async setupUrlProvider(repo, config) {
    const urlProvider = await getUrlProvider(repo);
    this.urlProvider = urlProvider;
    //prerequisites to permit the use of gitlab
    if (!urlProvider || !config || !('token' in config)) {
      throw new ConfigurationError('Gitlab cannot be configured!');
    }
    const baseUrl = urlProvider.getBaseAPIUrl();
    log(`Using GitLab API URL ${baseUrl}`);
    this.setupGitlab(config, baseUrl);
    this.gitlabProject = config.project;
  }

  setupGitlab(config, baseUrl) {
    this.gitlab = new GitLab({
      baseUrl: baseUrl,
      privateToken: config.token,
      requestTimeout: 70000,
    });
  }

  async getProjectName() {
    if (this.gitlabProject) {
      return this.gitlabProject;
    } else {
      const url = await this.repo.getOriginUrl();
      const match = url.match(GITLAB_URL_REGEX);

      const user = match[1];
      const project = match[2];

      return `${user}/${project}`;
    }
  }

  getProject() {
    return this.getProjectName().then((project) => {
      if (!this.gitlab) {
        throw new ConfigurationError('Gitlab has to be configured!');
      }
      return this.gitlab.getProject(project.replaceAll('/', '%2F'));
    });
  }

  stop() {
    log('Stopping');
    this.stopping = true;
  }

  isStopping() {
    return this.stopping;
  }
}

export default BaseGitLabIndexer;
