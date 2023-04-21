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
    const repoName = (await this.repo.getOriginUrl()).substring('https://github.com'.length + 1).slice(0, -'.git'.length);

    log(`fetching branch data from ${currentBranch}[${currentBranch}]`);
    this.controller = new GitHub({
      baseUrl: 'https://api.github.com',
      privateToken: config?.auth?.token,
      requestTimeout: config.timeout,
    });

    this.indexer = new CIIndexer(this.reporter, this.controller, repoName, async (pipeline, jobs) => {
      jobs = jobs || [];
      log(
        `create build ${JSON.stringify({
          id: pipeline.id,
          number: pipeline.number,
          sha: pipeline.commit.sha,
          status: convertState(pipeline.state),
          updatedAt: moment(pipeline.updated_at).toISOString(),
          startedAt: moment(pipeline.started_at).toISOString(),
          finishedAt: moment(pipeline.finished_at).toISOString(),
          committedAt: moment(pipeline.commit.committed_at).toISOString(),
        })}`
      );
      const username = (pipeline.created_by || {}).login;
      const userFullName = username !== undefined ? (await this.github.users.getByUsername({ username: username })).data.name : '';
      return Build.persist({
        id: pipeline.id,
        sha: pipeline.commit.sha,
        ref: pipeline.commit.ref,
        status: convertState(pipeline.state),
        tag: pipeline.tag,
        user: username,
        userFullName: userFullName,
        createdAt: moment(pipeline.created_at || (jobs.length > 0 ? jobs[0].created_at : pipeline.started_at)).toISOString(),
        updatedAt: moment(pipeline.updated_at).toISOString(),
        startedAt: moment(pipeline.started_at).toISOString(),
        finishedAt: moment(pipeline.finished_at).toISOString(),
        committedAt: moment(pipeline.commit.committed_at).toISOString(),
        duration: pipeline.duration,
        jobs: jobs.map((job) => ({
          id: job.id,
          name: username,
          status: convertState(job.state),
          stage: job.stage,
          createdAt: moment(job.created_at).toISOString(),
          finishedAt: moment(job.finished_at).toISOString(),
          webUrl: this.urlProvider.getJobUrl(job.id),
        })),
        webUrl: this.urlProvider.getPipelineUrl(pipeline.id),
      });
    });
  }

  async index() {
    try {
      return await this.indexer.index();
    } catch (e) {
      console.log('Travis Indexer Failed! - ' + e.message);
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
    case 'passed':
      return 'success';
    default:
      return state;
  }
};

module.exports = GitHubCIIndexer;
