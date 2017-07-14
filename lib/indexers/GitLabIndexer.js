'use strict';

const gitlab = require('node-gitlab');
const log = require('debug')('idx:gitlab');

const Issue = require('../models/Issue.js');
const ctx = require('../context.js');

function GitLabIndexer(repo, reporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

GitLabIndexer.prototype.configure = function(config) {
  this.gitlab = gitlab.createPromise({
    url: config.url,
    privateToken: config.token,
    requestTimeout: 10000
  });
};

GitLabIndexer.prototype.index = function() {
  let myUrl;
  let omitCount = 0;
  let persistCount = 0;

  return this.repo
    .getOriginUrl()
    .bind(this)
    .then(function(url) {
      myUrl = url;

      log('Listing projects');
      return this.gitlab.projects.list();
    })
    .tap(function() {
      if (this.stopping) {
        return [];
      }

      log('Looking for a project with ssh-url %o', myUrl);
    })
    .reduce(function(foundProject, project) {
      if (project.ssh_url_to_repo === myUrl) {
        return project;
      }

      return foundProject;
    }, null)
    .then(function(project) {
      if (!project) {
        console.warn(`No project found matching ${myUrl} on gitlab.com`);
        return [];
      }

      log('Listing issues for project %o', project.id);
      return this.gitlab.issues.list({ id: project.id });
    })
    .tap(issues => this.reporter.setIssueCount(issues.length))
    .map(function(issue) {
      if (this.stopping) {
        return;
      }

      return Issue.persist(issue).bind(this).spread(function(issue, wasCreated) {
        if (wasCreated) {
          persistCount++;
        } else {
          omitCount++;
        }

        this.reporter.finishIssue();
      });
    })
    .tap(function() {
      log('Persisted %d new issues (%d already present)', persistCount, omitCount);
    });
};

GitLabIndexer.prototype.stop = function() {
  log('Stopping');
  this.stopping = true;
};

module.exports = GitLabIndexer;
