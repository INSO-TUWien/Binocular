/* eslint-disable no-useless-escape */
'use strict';

import debug from 'debug';
import ConfigurationError from '../../errors/ConfigurationError.js';
import Issue, { IssueDataType } from '../../models/models/Issue';
import MergeRequest, { MergeRequestDataType } from '../../models/models/MergeRequest';
import Mention from '../../types/supportingTypes/Mention';
import GitHub from '../../core/provider/github';
import ProgressReporter from '../../utils/progress-reporter.ts';
import { ItsIssueEvent } from '../../types/ItsTypes';
import Account, { AccountDataType } from '../../models/models/Account.ts';
import { Entry } from '../../models/Model.ts';
import IssueAccountConnection, { IssueAccountConnectionDataType } from '../../models/connections/IssueAccountConnection.ts';
import Connection from '../../models/Connection.ts';
import MergeRequestAccountConnection, {
  MergeRequestAccountConnectionDataType,
} from '../../models/connections/MergeRequestAccountConnection.ts';

const log = debug('idx:its:github');

const GITHUB_ORIGIN_REGEX = /(?:git@github.com:|https:\/\/github.com\/)([^\/]+)\/(.*?)(?=\.git|$)/;

function GitHubITSIndexer(repo: any, reporter: typeof ProgressReporter) {
  this.repo = repo;
  this.stopping = false;
  this.reporter = reporter;
}

GitHubITSIndexer.prototype.configure = async function (config: any) {
  if (!config) {
    throw ConfigurationError('configuration object has to be set!');
  }

  this.controller = new GitHub({
    baseUrl: 'https://api.github.com',
    privateToken: config?.auth?.token,
    requestTimeout: config.timeout,
  });
  return Promise.resolve();
};

GitHubITSIndexer.prototype.index = async function () {
  let owner: string;
  let repo: string;
  let omitIssueCount = 0;
  let omitMergeRequestCount = 0;
  let persistIssueCount = 0;
  let persistMergeRequestCount = 0;

  return Promise.resolve(this.repo.getOriginUrl()).then(async (url) => {
    if (url.includes('@')) {
      url = 'https://github.com/' + url.split('@github.com/')[1];
    }
    const match = url.match(GITHUB_ORIGIN_REGEX);
    if (!match) {
      throw new Error('Unable to determine github owner and repo from origin url: ' + url);
    }

    owner = match[1];
    repo = match[2];
    await this.controller.loadAssignableUsers(owner, repo);

    log('Getting issues for', `${owner}/${repo}`);

    // Persist Issues and Authors/Assignees
    const issues = await this.controller.getIssuesWithEvents(owner, repo);
    this.reporter.setIssueCount(issues.length);

    for (const issue of issues) {
      log('Processing Issue #' + issue.number);

      let issueEntry: Entry<IssueDataType>;
      const authorEntry: Entry<AccountDataType> = (await Account.ensureGitHubAccount(this.controller.getUser(issue.author.login)))[0];
      const assigneeEntries: Entry<AccountDataType>[] = [];

      // create github account objects for each user
      for (const a of issue.assignees.nodes) {
        assigneeEntries.push((await Account.ensureGitHubAccount(this.controller.getUser(a.login)))[0]);
      }

      issue.author.name = this.controller.getUser(issue.author.login).name;
      if (issue.assignees.nodes.length > 0) {
        issue.assignees.nodes[0].name = this.controller.getUser(issue.assignees.nodes[0].login).name;
      }

      for (let i = 0; i < issue.assignees.nodes.length; i++) {
        issue.assignees.nodes[i].name = this.controller.getUser(issue.assignees.nodes[i].login).name;
      }
      await Issue.findOneByExample({ id: String(issue.id) })
        .then((existingIssue) => {
          if (!existingIssue || new Date(existingIssue.data.updatedAt).getTime() < new Date(issue.updatedAt).getTime()) {
            log('Processing issue #' + issue.iid);

            return Issue.persist({
              id: issue.id.toString(),
              iid: issue.number,
              title: issue.title,
              description: issue.body,
              state: issue.state,
              url: issue.url,
              closedAt: issue.closedAt,
              createdAt: issue.createdAt,
              updatedAt: issue.updatedAt,
              labels: issue.labels.nodes,
              milestone: issue.milestone,
              author: issue.author,
              assignee: issue.assignees.nodes[0],
              assignees: issue.assignees.nodes,
              webUrl: issue.url,
              mentions: issue.timelineItems.nodes.map((event: ItsIssueEvent) => {
                return {
                  commit: event.commit ? event.commit.oid : null,
                  createdAt: event.createdAt,
                  closes: event.commit === undefined,
                } as Mention;
              }),
            }).then(([persistedIssue, wasCreated]) => {
              // save the entry object of the issue so we can connect it to the github users later
              issueEntry = persistedIssue;
              if (wasCreated) {
                persistIssueCount++;
              }
              log('Persisted issue #' + persistedIssue.data.iid);
            });
          } else {
            // save the entry object of the issue so we can connect it to the github users later
            issueEntry = existingIssue;
            log('Skipping issue #' + issue.iid);
            omitIssueCount++;
          }
        })
        .then(() => {
          // connect the issue to the users (either as author, assignee or assignees)
          connectIssuesToUsers(IssueAccountConnection, issueEntry, authorEntry, assigneeEntries);
          this.reporter.finishIssue();
        });
    }

    log('Persisted %d new issues (%d already present)', persistIssueCount, omitIssueCount);

    // Persist Merge Requests and Authors/Assignees
    const mergeRequests = await this.controller.getPullRequestsWithEvents(owner, repo);
    this.reporter.setMergeRequestCount(mergeRequests.length);

    for (const mergeRequest of mergeRequests) {
      log('Processing Issue #' + mergeRequest.number);

      // create github account objects for each user
      let mrEntry: Entry<IssueDataType>;
      const authorEntry: Entry<AccountDataType> = (
        await Account.ensureGitHubAccount(this.controller.getUser(mergeRequest.author.login))
      )[0];
      const assigneeEntries: Entry<AccountDataType>[] = [];

      for (const a of mergeRequest.assignees.nodes) {
        assigneeEntries.push((await Account.ensureGitHubAccount(this.controller.getUser(a.login)))[0]);
      }

      mergeRequest.author.name = this.controller.getUser(mergeRequest.author.login).name;
      if (mergeRequest.assignees.nodes.length > 0) {
        mergeRequest.assignees.nodes[0].name = this.controller.getUser(mergeRequest.assignees.nodes[0].login).name;
      }

      for (let i = 0; i < mergeRequest.assignees.nodes.length; i++) {
        mergeRequest.assignees.nodes[i].name = this.controller.getUser(mergeRequest.assignees.nodes[i].login).name;
      }
      await MergeRequest.findOneByExample({ id: String(mergeRequest.id) })
        .then((existingMergeRequest) => {
          if (
            !existingMergeRequest ||
            new Date(existingMergeRequest.data.updatedAt).getTime() < new Date(mergeRequest.updatedAt).getTime()
          ) {
            log('Processing issue #' + mergeRequest.iid);
            return MergeRequest.persist({
              id: mergeRequest.id.toString(),
              iid: mergeRequest.number,
              title: mergeRequest.title,
              description: mergeRequest.body,
              state: mergeRequest.state,
              url: mergeRequest.url,
              closedAt: mergeRequest.closedAt,
              createdAt: mergeRequest.createdAt,
              updatedAt: mergeRequest.updatedAt,
              labels: mergeRequest.labels.nodes,
              milestone: mergeRequest.milestone,
              author: mergeRequest.author,
              assignee: mergeRequest.assignees.nodes[0],
              assignees: mergeRequest.assignees.nodes,
              webUrl: mergeRequest.url,
              mentions: mergeRequest.timelineItems.nodes.map((event: ItsIssueEvent) => {
                return {
                  commit: event.commit ? event.commit.oid : null,
                  createdAt: event.createdAt,
                  closes: event.commit === undefined,
                } as Mention;
              }),
            }).then(([persistedMergeRequest, wasCreated]) => {
              // save the entry object of the issue so we can connect it to the github users later
              mrEntry = persistedMergeRequest;
              if (wasCreated) {
                persistMergeRequestCount++;
              }
              log('Persisted mergeRequest #' + persistedMergeRequest.data.iid);
            });
          } else {
            mrEntry = existingMergeRequest;
            log('Skipping mergeRequest #' + mergeRequest.iid);
            omitMergeRequestCount++;
          }
        })
        .then(() => {
          // connect the MR to the users (either as author, assignee or assignees)
          connectIssuesToUsers(MergeRequestAccountConnection, mrEntry, authorEntry, assigneeEntries);
          this.reporter.finishMergeRequest();
        });
    }
    log('Persisted %d new mergeRequests (%d already present)', persistMergeRequestCount, omitMergeRequestCount);
  });
};

// connects issues or merge requests to accounts
const connectIssuesToUsers = (
  conn: Connection<
    IssueAccountConnectionDataType | MergeRequestAccountConnectionDataType,
    IssueDataType | MergeRequestDataType,
    AccountDataType
  >,
  issue: Entry<IssueDataType | MergeRequestDataType>,
  author: Entry<AccountDataType>,
  assignees: Entry<AccountDataType>[],
) => {
  conn.ensureWithData({ role: 'author' }, { from: issue, to: author });
  if (assignees.length > 0) {
    IssueAccountConnection.ensureWithData({ role: 'assignee' }, { from: issue, to: assignees[0] });
  }
  assignees.map((ae) => {
    IssueAccountConnection.ensureWithData({ role: 'assignees' }, { from: issue, to: ae });
  });
};

GitHubITSIndexer.prototype.isStopping = function () {
  return this.stopping;
};

GitHubITSIndexer.prototype.stop = function () {
  log('Stopping');
  this.stopping = true;
};

export default GitHubITSIndexer;
