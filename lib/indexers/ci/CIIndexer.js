'use strict';

const Build = require('../../models/Build.js');
const Promise = require('bluebird');
const log = require('debug')('idx:ci:indexer');

class CIIndexer {
  constructor(progressReporter, controller, projectId, createBuildArtifactHandler) {
    this.reporter = progressReporter;
    this.controller = controller;
    this.projectId = projectId;
    this.stopping = false;

    if (typeof createBuildArtifactHandler !== 'function') {
      throw new Error('createBuildArtifactHandler must hold a build mapping function!');
    }
    this.buildMapper = createBuildArtifactHandler;
  }

  index() {
    let omitCount = 0;
    let persistCount = 0;

    return Promise.resolve(this.projectId)
      .then(projectId =>
        this.controller.getPipelines(projectId).on('count', count => this.reporter.setBuildCount(count)).each(pipeline => {
          pipeline.id = pipeline.id.toString();
          return Build.findOneById(pipeline.id)
            .then(existingBuild => {
              if (
                !this.stopping &&
                (!existingBuild || new Date(existingBuild.updatedAt).getTime() < new Date(pipeline.updatedAt).getTime())
              ) {
                log('Processing build #' + pipeline.id);
                return Promise.join(
                  this.controller.getPipeline(projectId, pipeline.id),
                  this.controller.getPipelineJobs(projectId, pipeline.id)
                )
                  .spread(this.buildMapper)
                  .then(() => persistCount++);
              } else {
                log('Skipping build #' + pipeline.id);
                omitCount++;
              }
            })
            .then(() => this.reporter.finishBuild());
        })
      )
      .tap(function() {
        log('Persisted %d new builds (%d already present)', persistCount, omitCount);
      });
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }
}

module.exports = CIIndexer;
