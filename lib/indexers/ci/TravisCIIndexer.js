'use strict';

const Build = require('../../models/Build.js');
const FindFiles = require('file-regex');
const UrlProvider = require('../../url-providers');
const _ = require('lodash');
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

    this.controller = new TravisCI({
      baseUrl: this.urlProvider.getApiUrl(),
      privateToken: config.auth,
      requestTimeout: config.timeout
    });

    this.indexer = new CIIndexer(this.reporter, this.controller, await this.urlProvider.getProjectName(), (pipeline, jobs) => {
      pipeline.jobs = jobs.map(job => ({
        id: job.id,
        name: job.name,
        status: job.status || job.state,
        stage: job.stage,
        createdAt: job.created_at,
        finishedAt: job.finished_at,
        webUrl: this.urlProvider.getJobUrl(job.id)
      }));

      pipeline.webUrl = this.urlProvider.getPipelineUrl(pipeline.id);
      return Build.persist(_.mapKeys(pipeline, (v, k) => _.camelCase(k)));
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

module.exports = TravisCIIndexer;
