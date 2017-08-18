'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const gitlab = require('node-gitlab');
const log = require('debug')('idx:gitlab');

const Issue = require('../models/Issue.js');
const IssueCommitConnection = require('../models/IssueCommitConnection.js');
const ctx = require('../context.js');

const DEFAULT_MENTIONED_REGEX = /^mentioned in commit ([0-9a-f]+)$/;
const DEFAULT_CLOSED__REGEX = /^(?:(?:closed|closed via merge request .*|Status changed to closed)|(?:Status changed to closed by|closed via)(?: commit ([0-9a-f]+)))$/;

function GitLabIndexer(repo, reporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

GitLabIndexer.prototype.configure = function(config) {
  // TODO adjust config api url
  console.log(config.url);
  this.gitlab = gitlab.createPromise({
    api: 'https://gitlab.com/api/v4',
    privateToken: config.token,
    requestTimeout: 25000
  });

  this.mentionedRegex = config.issueMentionedRegex || DEFAULT_MENTIONED_REGEX;
  this.closedRegex = config.issueClosedRegex || DEFAULT_CLOSED__REGEX;
};

GitLabIndexer.prototype.index = function() {
  let myUrl;
  let omitCount = 0;
  let persistCount = 0;

  let project;

  return this.repo
    .getOriginUrl()
    .bind(this)
    .then(function(url) {
      myUrl = url;

      // TODO speficially "search" for project!
      log('Listing projects');
      return this.gitlab.projects.list({ owned: true });
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
    .then(function(_project) {
      if (!_project) {
        console.warn(`No project found matching ${myUrl} on gitlab.com`);
        return [];
      }

      project = _project;

      ctx.projectUrl = project.web_url;
      log('Listing issues for project %o', project.id);
      // TODO implement pagination here
      return this.gitlab.issues.list({ id: project.id, per_page: 100 });
    })
    .tap(issues => this.reporter.setIssueCount(issues.length))
    .map(function(issue) {
      if (this.stopping) {
        return;
      }

      let closedAt;

      return Promise.reduce(
        this.gitlab.issues.listNotes({ id: project.id, issue_id: issue.iid }),
        (mentions, note) => {
          const mention = this.mentionedRegex.exec(note.body);
          const closed = this.closedRegex.exec(note.body);

          if (mention) {
            return [...mentions, { commit: mention[1], createdAt: note.created_at }];
          } else if (closed) {
            closedAt = note.created_at;
            return [...mentions, { commit: closed[1], createdAt: note.created_at, closes: true }];
          } else {
            return mentions;
          }
        },
        []
      ).then(mentions => {
        const issueData = _.merge(_.mapKeys(issue, (v, k) => _.camelCase(k)), {
          mentions,
          closedAt
        });

        log('Persisting', issueData);
        return Issue.persist(issueData).bind(this).spread(function(issue, wasCreated) {
          if (wasCreated) {
            persistCount++;
          } else {
            omitCount++;
          }

          this.reporter.finishIssue();
        });
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
