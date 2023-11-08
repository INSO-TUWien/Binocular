'use strict';

const Build = require('../../models/Build.js');
const FindFiles = require('file-regex');
const UrlProvider = require('../../url-providers');
const log = require('debug')('importer:github-ci-indexer');
const ConfigurationError = require('../../errors/ConfigurationError.js');
const CIIndexer = require('./CIIndexer');
const moment = require('moment');
const { Octokit } = require('@octokit/rest');
const GitHub = require('../../core/provider/github');

const GITHUB_ORIGIN_REGEX = /(?:git@github.com:|https:\/\/github.com\/)([^/]+)\/(.*?)(?=\.git|$)/;

class GitHubCIIndexer {
  constructor(repository, progressReporter) {
    this.repo = repository;
    this.reporter = progressReporter;
    this.stopping = false;
  }

  async configure(config) {
    this.urlProvider = await UrlProvider.getCiUrlProvider(this.repo, this.reporter);

    this.github = new Octokit({
      baseUrl: 'https://api.github.com',
      auth: config?.auth?.token,
    });

    //prerequisites to permit the use of travis
    if (!this.urlProvider || !config) {
      throw new ConfigurationError('GitHub/Octokit cannot be configured!');
    }

    const currentBranch = await this.repo.getCurrentBranch();
    let originUrl = await this.repo.getOriginUrl();
    if (originUrl.includes('@')) {
      originUrl = 'https://github.com/' + originUrl.split('@github.com/')[1];
    }
    let repoName = originUrl.substring('https://github.com'.length + 1);
    if (repoName.endsWith('.git')) {
      repoName = repoName.slice(0, -'.git'.length);
    }

    const match = originUrl.match(GITHUB_ORIGIN_REGEX);
    if (!match) {
      throw new Error('Unable to determine github owner and repo from origin url: ' + originUrl);
    }

    this.owner = match[1];
    this.repo = match[2];

    log(`fetching branch data from ${currentBranch}[${currentBranch}]`);
    this.controller = new GitHub({
      baseUrl: 'https://api.github.com',
      privateToken: config?.auth?.token,
      requestTimeout: config.timeout,
    });

    await this.controller.loadAssignableUsers(this.owner, this.repo);

    this.indexer = new CIIndexer(this.reporter, this.controller, repoName, async (pipeline, jobs) => {
      jobs = jobs || [];
      log(
        `create build ${JSON.stringify({
          id: pipeline.id,
          number: pipeline.run_number,
          sha: pipeline.head_commit.sha,
          status: convertState(pipeline.status),
          updatedAt: moment(pipeline.updated_at).toISOString(),
          startedAt: moment(pipeline.run_started_at).toISOString(),
          finishedAt: moment(pipeline.updated_at).toISOString(),
          committedAt: moment(pipeline.head_commit.timestamp).toISOString(),
        })}`
      );
      const username = (pipeline.actor || {}).login;
      const userFullName = username !== undefined ? this.controller.getUser(username).name : '';
      let status = 'cancelled';
      let lastStartedAt = pipeline.run_started_at;
      let lastFinishedAt = pipeline.updated_at;
      if (jobs.length > 0) {
        status = convertState(jobs[jobs.length - 1].conclusion);
        lastStartedAt = jobs[jobs.length - 1].created_at;
        lastFinishedAt = jobs[jobs.length - 1].completed_at;
      }
      return Build.persist({
        id: pipeline.id,
        sha: pipeline.head_sha,
        ref: pipeline.head_commit.id,
        status: status,
        tag: pipeline.display_title,
        user: username,
        userFullName: userFullName !== null ? userFullName : username,
        createdAt: moment(pipeline.created_at || (jobs.length > 0 ? jobs[0].created_at : pipeline.started_at)).toISOString(),
        updatedAt: moment(pipeline.updated_at).toISOString(),
        startedAt: moment(pipeline.run_started_at).toISOString(),
        finishedAt: moment(lastFinishedAt).toISOString(),
        committedAt: moment(pipeline.head_commit.committed_at).toISOString(),
        duration: moment(lastFinishedAt).unix() - moment(lastStartedAt).unix(),
        jobs: jobs.map((job) => ({
          id: job.id,
          name: username,
          status: job.conclusion,
          stage: job.conclusion,
          createdAt: moment(job.created_at).toISOString(),
          finishedAt: moment(job.completed_at).toISOString(),
          webUrl: job.html_url,
        })),
        webUrl: pipeline.html_url,
      });
    });
  }

  index() {
    try {
      return this.indexer.index();
    } catch (e) {
      console.log('GitHubCI Indexer Failed! - ' + e.message);
    }
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    if (this.indexer && !this.indexer.isStopping()) {
      this.indexer.stop();
    }

    if (this.controller && !this.controller.isStopping()) {
      this.controller.stop();
    }
    this.stopping = true;
  }
}

const convertState = (state) => {
  switch (state) {
    case 'failure':
      return 'failed';
    default:
      return state;
  }
};

module.exports = GitHubCIIndexer;
