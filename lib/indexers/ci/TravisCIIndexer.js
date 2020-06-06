'use strict';

const Build = require('../../models/Build.js');
const FindFiles = require('file-regex');
const UrlProvider = require('../../url-providers');
const TravisCI = require('../../travis-ci');
const log = require('debug')('importer:travis-ci-indexer');
const ConfigurationError = require('../../errors/ConfigurationError.js');
const CIIndexer = require('./CIIndexer');

class TravisCIIndexer {
  constructor(repository, progressReporter) {
    this.repo = repository;
    this.reporter = progressReporter;
    this.stopping = false;
  }

  async configure(config) {
    this.source = await FindFiles(await this.repo.getRoot(), /.travis\.ya?ml$/);
    this.urlProvider = await UrlProvider.getCiUrlProvider(this.repo, this.reporter);

    //prerequisites to permit the use of travis
    if (!this.urlProvider || !config) {
      throw new ConfigurationError('Travis-CI cannot be configured!');
    }

    const currentBranch = await this.repo.getCurrentBranch();

    log(`fetching branch data from ${currentBranch.name()}[${currentBranch.shorthand()}]`);
    const tokens = config.token || {};
    this.controller = new TravisCI({
      baseUrl: this.urlProvider.getApiUrl(),
      tokens,
      requestTimeout: config.timeout,
      branch: currentBranch.shorthand()
    });

    this.indexer = new CIIndexer(this.reporter, this.controller, await this.urlProvider.getProjectName(), (pipeline, jobs) => {
      jobs = jobs || [];
      log(
        `create build ${JSON.stringify({
          id: pipeline.id,
          number: pipeline.number,
          sha: pipeline.commit.sha,
          status: convertState(pipeline.state),
          updatedAt: pipeline.updated_at,
          startedAt: pipeline.started_at,
          finishedAt: pipeline.finished_at,
          committedAt: pipeline.commit.committed_at
        })}`
      );
      return Build.persist({
        id: pipeline.id,
        sha: pipeline.commit.sha,
        ref: pipeline.commit.ref,
        status: convertState(pipeline.state),
        tag: pipeline.tag,
        user: pipeline.created_by.login,
        createdAt: jobs.length > 0 ? jobs[0].created_at : pipeline.started_at,
        updatedAt: pipeline.updated_at,
        startedAt: pipeline.started_at,
        finishedAt: pipeline.finished_at,
        committedAt: pipeline.commit.committed_at,
        duration: pipeline.duration,
        jobs: jobs.map(job => ({
          id: job.id,
          name: pipeline.created_by.login,
          status: convertState(job.state),
          stage: job.stage,
          createdAt: job.created_at,
          finishedAt: job.finished_at,
          webUrl: this.urlProvider.getJobUrl(job.id)
        })),
        webUrl: this.urlProvider.getPipelineUrl(pipeline.id)
      });
    });
  }

  async index() {
    return await this.indexer.index();
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    if (this.indexer && !this.indexer.isStopping()) {
      this.indexer.stop();
    }
    this.stopping = true;
  }
}

const convertState = state => {
  switch (state) {
    case 'passed':
      return 'success';
    default:
      return state;
  }
};

module.exports = TravisCIIndexer;
