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
    const project = await this.getProject();

    const projectId = project.path_with_namespace.replaceAll('/', '%2F');

    this.indexer = new CIIndexer(this.reporter, this.gitlab, projectId, (pipeline, jobs) => {
      pipeline.jobs = jobs.map((job) => ({
        id: job.id.replace('gid://gitlab/Ci::Build/', ''),
        name: job.name,
        status: job.status,
        stage: job.stage.name,
        createdAt: job.createdAt,
        finishedAt: job.finishedAt,
        webUrl: this.urlProvider.getJobUrl(String(job.id.replace('gid://gitlab/Ci::Build/', ''))),
      }));
      pipeline.id = String(pipeline.id).replace('gid://gitlab/Ci::Pipeline/', '');
      pipeline.webUrl = this.urlProvider.getPipelineUrl(pipeline.id);
      pipeline.status = pipeline.status.toLowerCase();
      pipeline.userFullName = pipeline.user.name;
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
