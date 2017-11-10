'use strict';

const _ = require('lodash');
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
            return Build.findOneById(pipeline.id).then(existingBuild => {
              if (!existingBuild || !existingBuild.finishedAt) {
                log('Processing build #' + pipeline.id);
                return this.gitlab
                  .getPipeline(project.id, pipeline.id)
                  .then(pipeline => {
                    return Build.persist(_.mapKeys(pipeline, (v, k) => _.camelCase(k)));
                  })
                  .then(() => persistCount++);
              } else {
                log('Skipping build #' + pipeline.id);
                omitCount++;
              }
            });
          });
      })
      .tap(function() {
        log('Persisted %d new builds (%d already present)', persistCount, omitCount);
      });
  }
}

module.exports = GitLabCIIndexer;
