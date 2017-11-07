'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const GitLab = require('../../gitlab.js');
const log = require('debug')('idx:its:gitlab');
const url = require('url');

const Issue = require('../../models/Issue.js');
const ctx = require('../../context.js');

const DEFAULT_MENTIONED_REGEX = /^mentioned in commit ([0-9a-f]+)$/;
const DEFAULT_CLOSED__REGEX = /^(?:(?:closed|closed via merge request .*|Status changed to closed)|(?:Status changed to closed by|closed via)(?: commit ([0-9a-f]+)))$/;

const GITLAB_URL_REGEX = /[\/:]([^\/]+)\/([^\/]+)\.git/;

function GitLabIndexer(repo, reporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

GitLabIndexer.prototype.configure = function(config) {
  return Promise.resolve(config.url || guessGitLabApiUrl(this.repo)).then(gitlabUrl => {
    const apiUrl = url.resolve(gitlabUrl, '/api/v4');
    log(`Using GitLab API URL ${apiUrl}`);

    this.gitlab = new GitLab({
      baseUrl: apiUrl,
      privateToken: config.token,
      requestTimeout: 70000
    });

    this.mentionedRegex = config.issueMentionedRegex || DEFAULT_MENTIONED_REGEX;
    this.closedRegex = config.issueClosedRegex || DEFAULT_CLOSED__REGEX;
    this.gitlabProject = config.project;
  });
};

GitLabIndexer.prototype.getProject = function() {
  return Promise.try(() => {
    if (this.gitlabProject) {
      return this.gitlabProject;
    } else {
      return this.repo.getOriginUrl().then(function(url) {
        const match = url.match(GITLAB_URL_REGEX);

        const user = match[1];
        const project = match[2];

        return `${user}/${project}`;
      });
    }
  });
};

GitLabIndexer.prototype.index = function() {
  let omitCount = 0;
  let persistCount = 0;

  return this.getProject()
    .bind(this)
    .then(function(project) {
      // must manually urlescape 'user/project'-string for gitlab API
      ctx.projectUrl = project.web_url;

      return this.gitlab.getProject(project.replace('/', '%2F'));
    })
    .then(function(project) {
      return this.gitlab
        .getIssues(project.id)
        .on('count', count => this.reporter.setIssueCount(count))
        .each(issue => {
          if (this.stopping) {
            return false;
          }

          issue.id = issue.id.toString();

          return Issue.findOneById(issue.id)
            .then(existingIssue => {
              if (
                !existingIssue ||
                new Date(existingIssue).getTime() <= new Date(issue).getTime()
              ) {
                log('Processing issue #' + issue.iid);
                return this.processComments(project, issue)
                  .spread((mentions, closedAt) => {
                    const issueData = _.merge(_.mapKeys(issue, (v, k) => _.camelCase(k)), {
                      mentions,
                      closedAt
                    });

                    if (!existingIssue) {
                      return Issue.create(issueData, { ignoreUnknownAttributes: true });
                    } else {
                      _.assign(issue, issueData);
                      return issue.save({ ignoreUnknownAttributes: true });
                    }
                  })
                  .then(() => persistCount++);
              } else {
                log('Skipping issue #' + issue.iid);
                omitCount++;
              }
            })
            .then(() => this.reporter.finishIssue());
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

function guessGitLabApiUrl(repo) {
  return repo.getOriginUrl().then(function(url) {
    const match = url.match(/git@(.*):(.*)\/(.*)\.git/);
    if (match) {
      return `https://${match[1]}/`;
    } else {
      return 'https://gitlab.com/';
    }
  });
}

GitLabIndexer.prototype.processComments = function(project, issue) {
  let closedAt;

  return this.gitlab
    .getNotes(project.id, issue.iid)
    .reduce((mentions, note) => {
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
    }, [])
    .then(mentions => [mentions, closedAt]);
};
