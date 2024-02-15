/* eslint-disable no-useless-escape */
'use strict';

import debug from 'debug';
import ConfigurationError from '../../errors/ConfigurationError.js';
import Issue from '../../models/Issue';
import MergeRequest from '../../models/MergeRequest.js';
import GitHub from '../../core/provider/github.ts';
import ProgressReporter from '../../utils/progress-reporter.ts';
import { ItsIssue, ItsIssueEvent } from '../../types/itsTypes.ts';

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

GitHubITSIndexer.prototype.index = function () {
  let owner: string;
  let repo: string;
  let omitCount = 0;
  let persistCount = 0;

  return Promise.resolve(this.repo.getOriginUrl())
    .then(async (url) => {
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
      return this.controller.github
        .paginate(this.controller.github.issues.listForRepo, {
          owner,
          repo,
          state: 'all',
          per_page: 100,
        })
        .then((issues: ItsIssue[]) => {
          this.reporter.setIssueCount(issues.length);
          return issues.forEach((issue) => {
            log('Processing Issue #' + issue.number);

            issue.user.name = this.controller.getUser(issue.user.login).name;
            if (issue.assignee !== null) {
              issue.assignee.name = this.controller.getUser(issue.assignee.login).name;
            }

            for (let i = 0; i < issue.assignees.length; i++) {
              issue.assignees[i].name = this.controller.getUser(issue.assignees[i].login).name;
            }
            if (issue.pull_request === undefined) {
              // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              Issue.findOneById(issue.id)
                .then((existingIssue) => {
                  if (!existingIssue || new Date(existingIssue.updatedAt).getTime() < new Date(issue.updated_at).getTime()) {
                    log('Processing issue #' + issue.iid);
                    // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    return Issue.persist({
                      id: issue.id,
                      iid: issue.number,
                      title: issue.title,
                      description: issue.body,
                      state: issue.state,
                      url: issue.url,
                      closedAt: issue.closed_at,
                      createdAt: issue.created_at,
                      updatedAt: issue.updated_at,
                      labels: issue.labels,
                      milestone: issue.milestone,
                      author: issue.user,
                      assignee: issue.assignee,
                      assignees: issue.assignees,
                      webUrl: issue.html_url,
                      mentions: [],
                    }).then(([persistedIssue, wasCreated]) => {
                      if (wasCreated) {
                        persistCount++;

                        return this.controller.github
                          .paginate(this.controller.github.issues.listEvents, {
                            owner,
                            repo,
                            issue_number: persistedIssue.data.iid,
                            per_page: 100,
                          })
                          .then((events: ItsIssueEvent[]) => {
                            log('Processing', events.length, 'events for Issue #' + persistedIssue.data.iid);
                            return events.forEach((event) => {
                              if (event.event === 'referenced' || event.event === 'closed') {
                                persistedIssue.data.mentions.push({
                                  commit: event.commit_id,
                                  createdAt: event.created_at,
                                  closes: event.event === 'closed',
                                });
                              }
                            });
                          })
                          .then(async () => {
                            return persistedIssue.save().then(() => {
                              log('Saved issue #' + persistedIssue.data.iid);
                            });
                          });
                      }
                    });
                  } else {
                    log('Skipping issue #' + issue.iid);
                    omitCount++;
                  }
                })
                .then(() => this.reporter.finishIssue());
            } else {
              // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              return MergeRequest.findOneById(issue.id)
                .then((existingMergeRequest) => {
                  if (!existingMergeRequest || new Date(existingMergeRequest.updatedAt).getTime() < new Date(issue.updated_at).getTime()) {
                    log('Processing existingMergeRequest #' + issue.iid);
                    // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    return MergeRequest.persist({
                      id: issue.id,
                      iid: issue.number,
                      title: issue.title,
                      description: issue.body,
                      state: issue.state,
                      url: issue.url,
                      closedAt: issue.closed_at,
                      createdAt: issue.created_at,
                      updatedAt: issue.updated_at,
                      labels: issue.labels,
                      milestone: issue.milestone,
                      author: issue.user,
                      assignee: issue.assignee,
                      assignees: issue.assignees,
                      webUrl: issue.html_url,
                      mentions: [],
                    }).then(([persistedMergeRequest, wasCreated]) => {
                      if (wasCreated) {
                        persistCount++;

                        return this.controller.github
                          .paginate(this.controller.github.issues.listEvents, {
                            owner,
                            repo,
                            issue_number: persistedMergeRequest.data.iid,
                            per_page: 100,
                          })
                          .then((events: ItsIssueEvent[]) => {
                            log('Processing', events.length, 'events for MergeRequest #' + persistedMergeRequest.data.iid);
                            return events.forEach((event) => {
                              if (event.event === 'referenced' || event.event === 'closed') {
                                persistedMergeRequest.data.mentions.push({
                                  commit: event.commit_id,
                                  createdAt: event.created_at,
                                  closes: event.event === 'closed',
                                });
                              }
                            });
                          })
                          .then(() => {
                            return persistedMergeRequest.save().then(() => {
                              log('Saved MergeRequest #' + persistedMergeRequest.data.iid);
                            });
                          });
                      }
                    });
                  } else {
                    log('Skipping MergeRequest #' + issue.iid);
                    omitCount++;
                  }
                })
                .then(() => this.reporter.finishIssue());
            }
          });
        });
    })
    .then(() => {
      log('Persisted %d new issues (%d already present)', persistCount, omitCount);
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
