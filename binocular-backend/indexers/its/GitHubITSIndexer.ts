/* eslint-disable no-useless-escape */
'use strict';

import debug from 'debug';
import ConfigurationError from '../../errors/ConfigurationError.js';
import Issue from '../../models/Issue';
import MergeRequest from '../../models/MergeRequest.js';
import GitHub from '../../core/provider/github.ts';
import ProgressReporter from '../../utils/progress-reporter.ts';
import { ItsIssue, ItsIssueEvent } from '../../types/itsTypes.ts';
import ReviewThread from '../../models/ReviewThread.ts';
import { createHash } from 'crypto';
import Comment from '../../models/Comment.ts';

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
  let omitIssueCount = 0;
  let omitMergeRequestCount = 0;
  let omitReviewThreadCount = 0;
  let omitCommentCount = 0;
  let persistIssueCount = 0;
  let persistMergeRequestCount = 0;
  let persistReviewThreadCount = 0;
  let persistCommentCount = 0;

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
      return Promise.all([
        this.controller.getIssuesWithEvents(owner, repo).then((issues: ItsIssue[]) => {
          this.reporter.setIssueCount(issues.length);
          return Promise.all(
            issues.map((issue) => {
              log('Processing Issue #' + issue.number);

              issue.author.name = this.controller.getUser(issue.author.login).name;
              if (issue.assignees.nodes.length > 0) {
                issue.assignees.nodes[0].name = this.controller.getUser(issue.assignees.nodes[0].login).name;
              }

              for (let i = 0; i < issue.assignees.nodes.length; i++) {
                issue.assignees.nodes[i].name = this.controller.getUser(issue.assignees.nodes[i].login).name;
              }
              return new Promise((resolve) => {
                Issue.findOneById(String(issue.id))
                  .then((existingIssue) => {
                    if (!existingIssue || new Date(existingIssue.data.updatedAt).getTime() < new Date(issue.updatedAt).getTime()) {
                      log('Processing issue #' + issue.iid);

                      return Issue.persist({
                        id: issue.id,
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
                          };
                        }),
                      }).then(([persistedIssue, wasCreated]) => {
                        if (wasCreated) {
                          persistIssueCount++;
                        }
                        log('Persisted issue #' + persistedIssue.data.iid);
                      });
                    } else {
                      log('Skipping issue #' + issue.iid);
                      omitIssueCount++;
                    }
                  })
                  .then(() => {
                    this.reporter.finishIssue();
                    resolve(true);
                  });
              });
            }),
          );
        }),
        this.controller.getPullRequestsWithEvents(owner, repo).then((mergeRequests: ItsIssue[]) => {
          this.reporter.setMergeRequestCount(mergeRequests.length);
          return Promise.all(
            mergeRequests.map((mergeRequest) => {
              log('Processing Issue #' + mergeRequest.number);

              mergeRequest.author.name = this.controller.getUser(mergeRequest.author.login).name;
              if (mergeRequest.assignees.nodes.length > 0) {
                mergeRequest.assignees.nodes[0].name = this.controller.getUser(mergeRequest.assignees.nodes[0].login).name;
              }

              for (let i = 0; i < mergeRequest.assignees.nodes.length; i++) {
                mergeRequest.assignees.nodes[i].name = this.controller.getUser(mergeRequest.assignees.nodes[i].login).name;
              }         
             
              for (let i = 0; i < mergeRequest.commentNodes.nodes.length; i++) {
                mergeRequest.commentNodes.nodes[i].author.name = this.controller.getUser(mergeRequest.commentNodes.nodes[i].author.login).name;
              }

              for(let i = 0; i < mergeRequest.reviewThreads.nodes.length; i++) {
                for(let j = 0; j < mergeRequest.reviewThreads.nodes[i].comments.nodes.length; j++) {
                  mergeRequest.reviewThreads.nodes[i].comments.nodes[j].author.name = this.controller.getUser(mergeRequest.reviewThreads.nodes[i].comments.nodes[j].author.login).name;
                }
              }
              
              return new Promise((resolve) => {
                return MergeRequest.findOneById(String(mergeRequest.id))
                  .then((existingMergeRequest) => {
                    if (
                      !existingMergeRequest ||
                      new Date(existingMergeRequest.data.updatedAt).getTime() < new Date(mergeRequest.updatedAt).getTime()
                    ) {
                      log('Processing issue #' + mergeRequest.iid);
                      return MergeRequest.persist({
                        id: mergeRequest.id,
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
                          };
                        }),
                      }).then(([persistedMergeRequest, wasCreated]) => {
                        if (wasCreated) {
                          persistMergeRequestCount++;
                        }
                        log('Persisted mergeRequest #' + persistedMergeRequest.data.iid);
                      });
                    } else {
                      log('Skipping mergeRequest #' + mergeRequest.iid);
                      omitMergeRequestCount++;
                    }
                  })
                  .then(() => {
                    log('Processing comments for mergeRequest #' + mergeRequest.id);
                    Promise.all(mergeRequest.commentNodes.nodes.map((comment) => {
                      return new Promise((resolve) => {
                        return Comment.findOneById(String(comment.id)).then((existingComment) => {
                          if(!existingComment ||
                            new Date(existingComment.data.updatedAt).getTime() < new Date(comment.updatedAt).getTime()) {
                              log('Processing comment #' + comment.id);
                              return Comment.persist({
                                id: comment.id,
                                author: comment.author,
                                updatedAt: comment.updatedAt,
                                createdAt: comment.createdAt,
                                lastEditedAt: comment.lastEditedAt,
                                path: comment.path,
                                bodyText: comment.bodyText,
                                mergeRequest: mergeRequest.id
                              }).then(([persistedComment, wasCreated]) => {
                                if(wasCreated) {
                                  persistCommentCount++;
                                }
                                log('Persisted comment #' + comment.id);
                              });
                            } else {
                              log('Skipping comment #' + comment.id);
                              omitCommentCount;
                            }
                        });
                      });
                    }))
                  })
                  .then(() => {
                    log('Processing Reviews for Issue #' + mergeRequest.number);
                    Promise.all(mergeRequest.reviewThreads.nodes.map((reviewThread => {
                      return new Promise((resolve) => {
                        return ReviewThread.findOneById(String(reviewThread.id)).then((existingReviewThread) => {                 
                          if(!existingReviewThread ||
                            reviewThread.path === existingReviewThread.data.path
                            && reviewThread.isResolved === existingReviewThread.data.isResolved
                            && reviewThread.resolvedBy === existingReviewThread.data.resolvedBy) {
                              log('Processing reviewThread #' + reviewThread.id);
                              return ReviewThread.persist({
                                id: reviewThread.id,
                                isResolved: reviewThread.isResolved,
                                resolvedBy: reviewThread.resolvedBy,
                                path: reviewThread.path,
                                mergeRequest: mergeRequest.id
                              }).then(([persitedReviewThread, wasCreated]) => {
                                if(wasCreated) {
                                  persistReviewThreadCount++;
                                }
                                log('Persisted reviewThread #' + reviewThread.id);
                              })
                            } else {
                              log('Skippig reviewThread #' + reviewThread.id);
                              omitReviewThreadCount++;
                            }
                        })
                        .then(() => {
                          log('Processing comments for reviewThread #' + reviewThread.id);
                          Promise.all(reviewThread.comments.nodes.map((comment) => {
                            return new Promise((resolve) => {
                              return Comment.findOneById(String(comment.id)).then((existingComment) => {
                                if(!existingComment || 
                                  new Date(existingComment.data.updatedAt).getTime() < new Date(comment.updatedAt).getTime()) {
                                    log('Processing comment #' + comment.id);
                                    return Comment.persist({
                                      id: comment.id,
                                      author: comment.author,
                                      createdAt: comment.createdAt,
                                      bodyText: comment.bodyText,
                                      updatedAt: comment.updatedAt,
                                      path: comment.path,
                                      lastEditedAt: comment.lastEditedAt,
                                      reviewThread: reviewThread.id,
                                    }).then(([persistedComment, wasCreated]) => {
                                      if(wasCreated) {
                                        persistCommentCount++;
                                      }
                                      log('Persisted comment #' + comment.id);
                                    })
                                  } else {
                                    log('Skipping comment #' + comment.id);
                                    omitCommentCount++;
                                  }
                              }).then(() => {
                                resolve(true);
                              })
                            })
                          }));
                        })
                        .then(() => {
                          resolve(true);
                        });
                      });
                    })));                  
                  })
                  .then(() => {
                    this.reporter.finishMergeRequest();
                    resolve(true);
                  });
              });
            }),
          );
        }),
      ]);
    })
    .then(() => {
      log('Persisted %d new issues (%d already present)', persistIssueCount, omitIssueCount);
      log('Persisted %d new mergeRequests (%d already present)', persistMergeRequestCount, omitMergeRequestCount);
      log('Persisted %d new reviewThreads (%d already present)', persistReviewThreadCount, omitReviewThreadCount);
      log('Persisted %d new comments (%d already present)', persistCommentCount, omitCommentCount);
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
