'use strict';

import _ from 'lodash';
import debug from 'debug';
import Issue from '../../models/models/Issue';
import MergeRequest from '../../models/models/MergeRequest';
import Milestone from '../../models/models/Milestone';
import BaseGitLabIndexer from '../BaseGitLabIndexer';
import Account from '../../models/models/Account';
import IssueAccountConnection from '../../models/connections/IssueAccountConnection';

const log = debug('idx:its:gitlab');

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
      }),
    );
  }

  async index() {
    let omitCount = 0;
    let persistCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            .collect(async (issues) => {
              // collect all issues and process them one by one
              for (const issue of issues) {
                if (this.stopping) {
                  return false;
                }

                // for each issue, check if it already exists
                const existingIssue = await Issue.findOneById(String(issue.id));

                let issueEntry = existingIssue;

                // first, persist the author/assignees associated to this issue
                const authorEntry = (await Account.ensureGitLabAccount(issue.author))[0];
                const assigneesEntries = [];
                for (const assignee of issue.assignees) {
                  assigneesEntries.push((await Account.ensureGitLabAccount(assignee))[0]);
                }

                // if the issue is not yet persisted or has been updated since it has last been persisted, process it
                if (!existingIssue || new Date(existingIssue.updatedAt).getTime() < new Date(issue.updated_at).getTime()) {
                  log('Processing issue #' + issue.iid);
                  // first, get the mentioned commits
                  const results = this.processComments(project, issue);
                  const mentions = results[0];
                  const closedAt = results[1];
                  const notes = results[2];
                  const issueData = _.merge(
                    _.mapKeys(issue, (v, k) => _.camelCase(k)),
                    {
                      mentions,
                      closedAt,
                      notes,
                    },
                  );
                  // if this is a new issue, persist it
                  if (!existingIssue) {
                    issueEntry = (await Issue.persist(issueData))[0];
                  } else {
                    // if this issue already exists, update its fields and save
                    _.assign(existingIssue, issueData);
                    issueEntry = (await existingIssue.save({ ignoreUnknownAttributes: true }))[0];
                  }

                  await this.connectIssuesToUsers(IssueAccountConnection, issueEntry, authorEntry, assigneesEntries);

                  persistCount++;
                } else {
                  log('Skipping issue #' + issue.iid);
                  omitCount++;
                }
                this.reporter.finishIssue();
              }
            }),
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
                          },
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
            }.bind(this),
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
            }.bind(this),
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

  // connects issues or merge requests to accounts
  connectIssuesToUsers = async (conn, issue, author, assignees) => {
    await conn.ensureWithData({ role: 'author' }, { from: issue, to: author });
    if (assignees.length > 0) {
      await conn.ensureWithData({ role: 'assignee' }, { from: issue, to: assignees[0] });
    }
    await Promise.all(
      assignees.map(async (ae) => {
        await conn.ensureWithData({ role: 'assignees' }, { from: issue, to: ae });
      }),
    );
  };
}

export default GitLabITSIndexer;
