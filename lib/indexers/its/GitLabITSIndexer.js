'use strict';

const _ = require('lodash');
const log = require('debug')('idx:its:gitlab');

const Issue = require('../../models/Issue.js');
const BaseGitLabIndexer = require('../BaseGitLabIndexer.js');

const DEFAULT_MENTIONED_REGEX = /^mentioned in commit ([0-9a-f]+)$/;
const DEFAULT_CLOSED__REGEX = /^(?:(?:closed|closed via merge request .*|Status changed to closed)|(?:Status changed to closed by|closed via)(?: commit ([0-9a-f]+)))$/;

class GitLabITSIndexer extends BaseGitLabIndexer {
  constructor() {
    super(...arguments);
  }

  configure(config) {
    return super.configure(config).tap(() => {
      this.mentionedRegex = config.issueMentionedRegex || DEFAULT_MENTIONED_REGEX;
      this.closedRegex = config.issueClosedRegex || DEFAULT_CLOSED__REGEX;
      this.gitlabProject = config.project;
    });
  }

  index() {
    let omitCount = 0;
    let persistCount = 0;

    return this.getProject()
      .bind(this)
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
                  new Date(existingIssue.updatedAt).getTime() <
                    new Date(issue.updated_at).getTime()
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
                        _.assign(existingIssue, issueData);
                        return existingIssue.save({ ignoreUnknownAttributes: true });
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
  }

  processComments(project, issue) {
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
  }
}

module.exports = GitLabITSIndexer;
