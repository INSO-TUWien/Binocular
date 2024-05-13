'use strict';

import Build from '../../models/models/Build';
import debug from 'debug';

const log = debug('idx:ci:indexer');

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
      .then((projectId) => {
        let pipelinesRequest;
        try {
          pipelinesRequest = this.controller.getPipelines(projectId);
        } catch (error) {
          // exception can be thrown if the server is unreachable
          console.error(`fetching ${projectId} failed because of following error: ${error.toString()}`);
        }

        if (!pipelinesRequest) {
          return Promise.resolve();
        }
        return pipelinesRequest.then((pipelines) => {
          this.reporter.setBuildCount(pipelines.length);
          return pipelines.map((pipeline) => {
            pipeline.id = pipeline.id.toString();
            // TODO i think this won't work. `findOneById` checks if there is a build in the db with `_id === pipeline.id`,
            //  but we want to find a build with `id === pipeline.id`
            return Build.findOneById(pipeline.id)
              .then((existingBuild) => {
                if (
                  !this.stopping &&
                  (!existingBuild || new Date(existingBuild.updatedAt).getTime() < new Date(pipeline.updatedAt).getTime())
                ) {
                  log(`Processing build #${pipeline.id} [${persistCount + omitCount}]`);

                  /*Only necessary fot GitHub.
                  GitLab already requests all jobs as part of the pipelines gwl query
                  All of this can be removed once GitHub supports GraphQl for Workflows.*/
                  return Promise.resolve(this.controller.getPipelineJobs(projectId, pipeline.id))
                    .then((jobs) => {
                      if (jobs === 'gitlab') {
                        return this.buildMapper(
                          pipeline,
                          pipeline.jobs.edges.map((edge) => edge.node),
                        );
                      } else {
                        return this.buildMapper(pipeline, jobs);
                      }
                    })
                    .then(() => {
                      persistCount++;
                    });
                  return this.buildMapper(pipeline, []);
                } else {
                  log(`Skipping build #${pipeline.id} [${persistCount + omitCount}]`);
                  omitCount++;
                }
              })
              .then(() => {
                this.reporter.finishBuild();
              });
          });
        });
      })
      .then(function (resp) {
        log('Persisted %d new builds (%d already present)', persistCount, omitCount);
        if (resp === false) {
          return Promise.resolve(resp);
        } else {
          return Promise.all(resp);
        }
      });
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }
}

export default CIIndexer;
