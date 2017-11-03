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
    log(`Using GitLab API URL: ${apiUrl}`);

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

  let project;

  return this.getProject()
    .bind(this)
    .then(function(project) {
      // must manually urlescape 'user/project'-string for gitlab API

      return this.gitlab.getProject(project.replace('/', '%2F'));
    })
    .then(function(project) {
      console.log('got project:', project);

      this.gitlab.getIssues(project.id).subscribe();

      //   return this.gitlab.projects.get({ id: project.replace('/', '%2F') });
      // })
      // .then(function(_project) {
      //   if (!_project) {
      //     console.warn('No matching project found on gitlab.com');
      //     return [];
      //   }

      //   project = _project;

      //   ctx.projectUrl = project.web_url;

      // TODO implement pagination here
      // return depaginate((page, per_page) =>
      //   this.gitlab.issues.list({ id: project.id, page, per_page })
      // );
      // return this.gitlab.issues.list({ id: project.id, per_page: 100 });
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

function depaginate(fetchFn, processFn, page = 1, perPage = 100) {
  return fetchFn(page, perPage).then(items => {
    if (items.length > 0) {
      return Promise.map(items, processFn).tap(() =>
        depaginate(fetchFn, processFn, page + 1, perPage)
      );
    }
  });
}
