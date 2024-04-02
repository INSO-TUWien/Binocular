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

  // helper function that persists the issues/mergeRequests and associated GitHub user accounts (plus connections)
  const processIssues = async (issues: any, type: string, targetCollection: typeof Issue | typeof MergeRequest) => {
    let persistCount = 0;
    let omitCount = 0;

    for (const issue of issues) {
      log(`Processing ${type} #` + issue.number);

      let issueEntry: Entry<IssueDataType | MergeRequestDataType>;

      // create GitHub account objects for each relevant user (author, assignee, assignees)
      const authorEntry: Entry<AccountDataType> = (await Account.ensureGitHubAccount(this.controller.getUser(issue.author.login)))[0];
      const assigneeEntries: Entry<AccountDataType>[] = [];
      for (const a of issue.assignees.nodes) {
        assigneeEntries.push((await Account.ensureGitHubAccount(this.controller.getUser(a.login)))[0]);
      }

      await targetCollection
        .findOneByExample({ id: String(issue.id) })
        .then((existingIssue) => {
          if (!existingIssue || new Date(existingIssue.data.updatedAt).getTime() < new Date(issue.updatedAt).getTime()) {
            log(`Processing ${type} #` + issue.iid);

            return targetCollection
              .persist({
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
                webUrl: issue.url,
                mentions: issue.timelineItems.nodes.map((event: ItsIssueEvent) => {
                  return {
                    commit: event.commit ? event.commit.oid : null,
                    createdAt: event.createdAt,
                    closes: event.commit === undefined,
                  } as Mention;
                }),
                notes: [], // not supported by GitHub
              })
              .then(([persistedIssue, wasCreated]) => {
                // save the entry object of the issue so we can connect it to the github users later
                issueEntry = persistedIssue;
                if (wasCreated) {
                  persistCount++;
                }
                log(`Persisted ${type} #` + persistedIssue.data.iid);
              });
          } else {
            // save the entry object of the issue so we can connect it to the github users later
            issueEntry = existingIssue;
            log(`Skipping ${type} #` + issue.iid);
            omitCount++;
          }
        })
        .then(() => {
          // connect the issue/MR to the users (either as author, assignee or assignees)
          if (type === 'issue') {
            connectIssuesToUsers(IssueAccountConnection, issueEntry, authorEntry, assigneeEntries);
            this.reporter.finishIssue();
          } else if (type === 'mergeRequest') {
            connectIssuesToUsers(MergeRequestAccountConnection, issueEntry, authorEntry, assigneeEntries);
            this.reporter.finishMergeRequest();
          }
        });
    }

    log(`Persisted %d new ${type}s (%d already present)`, persistCount, omitCount);
  };

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
    await processIssues(issues, 'issue', Issue);

    // Persist Merge Requests and Authors/Assignees
    const mergeRequests = await this.controller.getPullRequestsWithEvents(owner, repo);
    this.reporter.setMergeRequestCount(mergeRequests.length);
    await processIssues(mergeRequests, 'mergeRequest', MergeRequest);
  });
};

// connects issues or merge requests to accounts
const connectIssuesToUsers = async (
  conn: Connection<
    IssueAccountConnectionDataType | MergeRequestAccountConnectionDataType,
    IssueDataType | MergeRequestDataType,
    AccountDataType
  >,
  issue: Entry<IssueDataType | MergeRequestDataType>,
  author: Entry<AccountDataType>,
  assignees: Entry<AccountDataType>[],
) => {
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

GitHubITSIndexer.prototype.isStopping = function () {
  return this.stopping;
};

GitHubITSIndexer.prototype.stop = function () {
  log('Stopping');
  this.stopping = true;
};

export default GitHubITSIndexer;
