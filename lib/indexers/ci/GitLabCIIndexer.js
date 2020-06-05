'use strict';

const _ = require('lodash');

const Build = require('../../models/Build.js');

const BaseGitLabIndexer = require('../BaseGitLabIndexer.js');
const CIIndexer = require('./CIIndexer');

class GitLabCIIndexer extends BaseGitLabIndexer {
  constructor(repository, progressReporter) {
    super(repository, progressReporter);
  }

  async configure(config) {
    await super.configure(config);

    this.indexer = new CIIndexer(this.reporter, this.gitlab, await this.getProject(), (pipeline, jobs) => {
      pipeline.jobs = jobs.map(job => ({
        id: job.id,
        name: job.name,
        status: job.status,
        stage: job.stage,
        createdAt: job.created_at,
        finishedAt: job.finished_at,
        webUrl: this.urlProvider.getJobUrl(job.id)
      }));

      pipeline.webUrl = this.urlProvider.getPipelineUrl(pipeline.id);
      return Build.persist(_.mapKeys(pipeline, (v, k) => _.camelCase(k)));
    });
  }

  index() {
    return this.indexer.index();
  }

  stop() {
    if (this.indexer && !this.indexer.isStopping()) {
      this.indexer.stop();
    }
    this.stopping = true;
  }
}

module.exports = GitLabCIIndexer;
