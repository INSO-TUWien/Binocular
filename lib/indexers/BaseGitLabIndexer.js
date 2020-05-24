'use strict';

const Promise = require('bluebird');
const GitLab = require('../gitlab.js');
const log = require('debug')('idx:gitlab');
const getUrlProvider = require('../url-providers');
const ConfigurationError = require('../errors/ConfigurationError.js');

const GITLAB_URL_REGEX = /[\/:]([^\/]+)\/([^\/]+)\.git/;

class BaseGitLabIndexer {
  constructor(repo, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config) {
    return getUrlProvider(this.repo).then(urlProvider => {
      this.urlProvider = urlProvider;

      //prerequisites to permit the use of gitlab
      if (!urlProvider || !config || !('token' in config)) {
        throw new ConfigurationError('Gitlab cannot be configured!');
      }

      const apiUrl = urlProvider.getApiUrl();
      log(`Using GitLab API URL ${apiUrl}`);

      this.gitlab = new GitLab({
        baseUrl: apiUrl,
        privateToken: config.token,
        requestTimeout: 70000
      });

      this.gitlabProject = config.project;
    });
  }

  getProjectName() {
    return Promise.try(() => {
      if (this.gitlabProject) {
        return this.gitlabProject;
      } else {
        return this.repo.getOriginUrl().then(function(url) {
          const match = url.match(GITLAB_URL_REGEX);

          const user = match[1];
          const project = match[2];

          return `${user}/${project}`;
        });
      }
    });
  }

  getProject() {
    return this.getProjectName().then(project => {
      if (!this.gitlab) {
        throw new ConfigurationError('Gitlab has to be configured!');
      }

      return this.gitlab.getProject(project.replace('/', '%2F'));
    });
  }

  stop() {
    log('Stopping');
    this.stopping = true;
  }
}

module.exports = BaseGitLabIndexer;
