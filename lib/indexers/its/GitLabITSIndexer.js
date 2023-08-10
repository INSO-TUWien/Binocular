'use strict';

const _ = require('lodash');
const log = require('debug')('idx:its:gitlab');

const Issue = require('../../models/Issue.js');
const MergeRequest = require('../../models/MergeRequest.js');
const Milestone = require('../../models/Milestone');
const BaseGitLabIndexer = require('../BaseGitLabIndexer.js');

const DEFAULT_MENTIONED_REGEX = /^mentioned in commit ([0-9a-f]+)$/;
// eslint-disable-next-line max-len
const DEFAULT_CLOSED__REGEX =
  /^(?:(?:closed|closed via merge request .*|Status changed to closed)|(?:Status changed to closed by|closed via)(?: commit ([0-9a-f]+)))$/;

class GitLabITSIndexer extends BaseGitLabIndexer {
  constructor() {
    super(...arguments);
  }

  configure(config) {
    return super.configure(
      Object.assign({}, config, {
        mentionedRegex: config.issueMentionedRegex || DEFAULT_MENTIONED_REGEX,
        closedRegex: config.issueClosedRegex || DEFAULT_CLOSED__REGEX,
      })
    );
  }

  index() {
    let omitCount = 0;
    let persistCount = 0;
    let omitMergeRequestCount = 0;
    let persistMergeRequestCount = 0;
    let omitMilestoneCount = 0;
    let persistMilestoneCount = 0;
    return this.getProject()
      .then((project) => {
        return Promise.all([
          this.gitlab
            .getIssues(project.id)
            .on('count', (count) => this.reporter.setIssueCount(count))
            .each(
              function (issue) {
                if (this.stopping) {
                  return false;
                }

                issue.id = issue.id.toString();
                return Issue.findOneById(issue.id)
                  .then((existingIssue) => {
                    if (!existingIssue || new Date(existingIssue.updatedAt).getTime() < new Date(issue.updated_at).getTime()) {
                      log('Processing issue #' + issue.iid);
                      return this.processComments(project, issue)
                        .then((results) => {
                          const mentions = results[0];
                          const closedAt = results[1];
                          const notes = results[2];
                          const issueData = _.merge(
                            _.mapKeys(issue, (v, k) => _.camelCase(k)),
                            {
                              mentions,
                              closedAt,
                              notes,
                            }
                          );
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
              }.bind(this)
            ),
          this.gitlab.getMergeRequests(project.id).each(
            function (mergeRequest) {
              return MergeRequest.findOneById(mergeRequest.id)
                .then((existingMergeRequest) => {
                  if (
                    !existingMergeRequest ||
                    new Date(existingMergeRequest.updatedAt).getTime() < new Date(mergeRequest.updated_at).getTime()
                  ) {
                    log('Processing mergeRequest #' + mergeRequest.iid);
                    return this.processMergeRequestNotes(project, mergeRequest)
                      .then((notes) => {
                        const mergeRequestData = _.merge(
                          _.mapKeys(mergeRequest, (v, k) => _.camelCase(k)),
                          {
                            notes,
                          }
                        );
                        if (!existingMergeRequest) {
                          return MergeRequest.persist(mergeRequestData);
                        } else {
                          _.assign(existingMergeRequest, mergeRequestData);
                          return existingMergeRequest.save({ ignoreUnknownAttributes: true });
                        }
                      })
                      .then(() => persistMergeRequestCount++);
                  } else {
                    log('Skipping mergeRequest #' + mergeRequest.iid);
                    omitMergeRequestCount++;
                  }
                })
                .then(() => this.reporter.finishMergeRequest());
            }.bind(this)
          ),
          this.gitlab.getMileStones(project.id).each(
            function (milestone) {
              return Milestone.findOneById(milestone.id)
                .then((existingMilestone) => {
                  const mileStoneData = _.merge(_.mapKeys(milestone, (v, k) => _.camelCase(k)));
                  if (!existingMilestone || new Date(existingMilestone.updatedAt).getTime() < new Date(milestone.updated_at).getTime()) {
                    log('Processing mergeRequest #' + milestone.iid);
                    return Milestone.persist(mileStoneData).then(() => persistMilestoneCount++);
                  } else {
                    _.assign(existingMilestone, mileStoneData).then(() => omitMilestoneCount++);
                    return existingMilestone.save({ ignoreUnknownAttributes: true });
                  }
                })
                .then(() => this.reporter.finishMilestone());
            }.bind(this)
          ),
        ]).then((resp) => resp);
      })
      .then(function (resp) {
        log('Persisted %d new issues (%d already present)', persistCount, omitCount);
        return Promise.all(resp.flat());
      });
  }

  processComments(project, issue) {
    let closedAt;
    const mentions = [];
    const notes = [];
    return this.gitlab
      .getNotes(project.id, issue.iid)
      .each((note) => {
        notes.push(note);
        const mention = DEFAULT_MENTIONED_REGEX.exec(note.body);
        const closed = DEFAULT_CLOSED__REGEX.exec(note.body);
        if (mention) {
          mentions.push({ commit: mention[1], createdAt: note.created_at });
        } else if (closed) {
          closedAt = note.created_at;
          mentions.push({ commit: closed[1], createdAt: note.created_at, closes: true });
        }
      })
      .then(() => [mentions, closedAt, notes]);
  }

  processMergeRequestNotes(project, mergeRequest) {
    let closedAt;
    const mentions = [];
    const notes = [];
    return this.gitlab
      .getMergeRequestNotes(project.id, mergeRequest.iid)
      .each((note) => {
        notes.push(note);
      })
      .then(() => notes);
  }

  isStopping() {
    return this.stopping;
  }
}

module.exports = GitLabITSIndexer;
