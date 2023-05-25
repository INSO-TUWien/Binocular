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
    console.log(config);
    const project = await this.getProject();
    const projectId = project.path_with_namespace.replace('/', '%2F');

    this.indexer = new CIIndexer(this.reporter, this.gitlab, projectId, (pipeline, jobs) => {
      pipeline.jobs = jobs.map((job) => ({
        id: job.id,
        name: job.name,
        status: job.status,
        stage: job.stage,
        createdAt: job.created_at,
        finishedAt: job.finished_at,
        webUrl: this.urlProvider.getJobUrl(String(job.id)),
      }));
      pipeline.webUrl = this.urlProvider.getPipelineUrl(String(pipeline.id));
      return Build.persist(_.mapKeys(pipeline, (v, k) => _.camelCase(k)));
    });
  }

  index() {
    return this.indexer.index();
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    if (this.indexer && !this.indexer.isStopping()) {
      this.indexer.stop();
    }

    if (this.gitlab && !this.gitlab.isStopping()) {
      this.gitlab.stop();
    }

    this.stopping = true;
  }
}

module.exports = GitLabCIIndexer;
