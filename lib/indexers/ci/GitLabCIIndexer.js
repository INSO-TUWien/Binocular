'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const log = require('debug')('idx:ci:gitlab');

const Build = require('../../models/Build.js');

const BaseGitLabIndexer = require('../BaseGitLabIndexer.js');

class GitLabCIIndexer extends BaseGitLabIndexer {
  constructor() {
    super(...arguments);
  }

  index() {
    let omitCount = 0;
    let persistCount = 0;

    return this.getProject()
      .then(project => {
        return this.gitlab
          .getPipelines(project.id)
          .on('count', count => this.reporter.setBuildCount(count))
          .each(pipeline => {
            pipeline.id = pipeline.id.toString();
            return Build.findOneById(pipeline.id)
              .then(existingBuild => {
                if (!existingBuild || new Date(existingBuild.updatedAt).getTime() < new Date(pipeline.updatedAt).getTime()) {
                  log('Processing build #' + pipeline.id);
                  return Promise.join(
                    this.gitlab.getPipeline(project.id, pipeline.id),
                    this.gitlab.getPipelineJobs(project.id, pipeline.id)
                  )
                    .spread((pipeline, jobs) => {
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
                    })
                    .then(() => persistCount++);
                } else {
                  log('Skipping build #' + pipeline.id);
                  omitCount++;
                }
              })
              .then(() => this.reporter.finishBuild());
          });
      })
      .tap(function() {
        log('Persisted %d new builds (%d already present)', persistCount, omitCount);
      });
  }
}

module.exports = GitLabCIIndexer;
