/* eslint-disable no-useless-escape */
'use strict';
//rewrite in typescript
import _ from 'lodash';
import Jira from '../../core/provider/jira';

import debug from 'debug';
import ConfigurationError from '../../errors/ConfigurationError';
import Milestone from '../../models/Milestone';
import MergeRequest from '../../models/MergeRequest';
import Issue from '../../models/Issue';

const log = debug('idx:its:jira');

class JiraITSIndexer {
  private repo: string;
  private stopping: boolean;
  private reporter: any;

  private jira: any;
  private jiraProject: any;

  constructor(repo: string, reporter: any) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config: any) {
    log('configure(%o)', config);
    if (!config) {
      throw new ConfigurationError('Config is not set');
    }
    const options = {
      baseUrl: config.url,
      email: config.username,
      privateToken: config.token,
      requestTimeout: 40000,
    };
    this.jiraProject = config.project;
    this.jira = new Jira(options);
  }

  index() {
    log('index()');
    let omitCount = 0;
    let persistCount = 0;
    const that = this;
    return Promise.all([
      this.jira.getIssuesWithJQL('project=' + this.jiraProject).each(
        function (issue: any) {
          issue.id = issue.id.toString();
          if (that.stopping) {
            return false;
          }
          return this.jira.getMergeRequest(issue.id).then((mergeRequests: any) => {
            if (mergeRequests) {
              mergeRequests.forEach((mergeRequest: any) => {
                const toPersist = {
                  id: mergeRequest.id,
                  iid: issue.key,
                  title: mergeRequest.name,
                  description: issue.fields.description?.content[0][0]?.text,
                  state: issue.fields.status.statusCategory.key,
                  url: issue.self,
                  closedAt: issue.fields.resolutiondate,
                  createdAt: issue.fields.createdAt,
                  updatedAt: mergeRequest.lastUpdate,
                  upvotes: issue.fields?.votes.votes,
                  weight: issue.fields?.customfield_10016, //this field is used for the storypoints,
                  watches: issue.fields.watches.watchCount,
                  labels: issue.fields.labels,
                  milestone: issue.milestone,
                  author: issue.fields.creator.displayName,
                  assignee: issue.fields?.assignee?.displayName, // there can't be multiple assinges
                  assignees: issue.assignees,
                  webUrl: mergeRequest.url,
                };
                MergeRequest.findOneById(mergeRequests.id).then((persistedMergeRequest: any) => {
                  if (!persistedMergeRequest || !_.isEqual(toPersist, persistedMergeRequest)) {
                    if (!persistedMergeRequest) {
                      log('Persisting new Mergerequest');
                      return MergeRequest.persist(toPersist);
                    } else {
                      log('Mergerequest already exists, only updating values');
                      _.assign(persistedMergeRequest, toPersist);
                      return persistedMergeRequest.save({ ignoreUnknownAttributes: true });
                    }
                  }
                });
              });
            } else {
              // log('Issue with key %o has no pull request information', );
            }

            return Issue.findOneById(issue.id)
              .then((persistedIssue: any) => {
                if (!persistedIssue || new Date(persistedIssue.updatedAt).getTime() < new Date(issue.fields.updated).getTime()) {
                  // const mentioned = that.processComments(issue.fields);

                  return that
                    .processComments(issue)
                    .then((mentions: any) => {
                      const issueToSave = {
                        id: issue.id,
                        iid: issue.key,
                        title: issue.fields.summary,
                        description: issue.fields.description?.content[0][0]?.text,
                        state: issue.fields.status.statusCategory.key,
                        url: issue.self,
                        closedAt: issue.fields.resolutiondate,
                        mentions: mentions,
                        createdAt: issue.fields.createdAt,
                        updatedAt: issue.fields.updated,
                        upvotes: issue.fields?.votes.votes,
                        weight: issue.fields?.customfield_10016, //this field is used for the storypoints,
                        watches: issue.fields.watches.watchCount,
                        labels: issue.fields.labels,
                        milestone: issue.milestone,
                        author: issue.fields.creator.displayName,
                        assignee: issue.fields?.assignee?.displayName, // there can't be multiple assinges
                        assignees: issue.assignees,
                        webUrl: issue.self.split('/rest/api')[0] + '/browse/' + issue.key,
                      };
                      if (!persistedIssue) {
                        log('Persisting new issue');
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        return Issue.persist(issueToSave);
                      } else {
                        log('Issue already exists, only updating values');
                        _.assign(persistedIssue, issueToSave);
                        return persistedIssue.save({ ignoreUnknownAttributes: true });
                      }
                    })
                    .then(() => persistCount++);
                } else {
                  log('Omitted issue because it already is persisted');
                  omitCount++;
                }
              })
              .then(() => this.reporter.finishIssue());
          });
        }.bind(this)
      ),
      this.jira.getProjectVersions(this.jiraProject).each(function (projectVersion: any) {
        projectVersion.id = projectVersion.id.toString();
        return Milestone.findOneById(projectVersion.id)
          .then((persistedVersion: any) => {
            const expired = new Date(projectVersion.releaseDate).getTime() > new Date().getTime();
            const versionToPersist = {
              id: projectVersion.id,
              iid: projectVersion.projectId,
              description: projectVersion.description,
              startDate: projectVersion.startDate,
              dueDate: projectVersion?.releaseDate,
              title: projectVersion.name,
              expired: expired,
              state: projectVersion.released ? 'released' : 'unreleased',
            };
            if (!persistedVersion || !_.isEqual(persistedVersion, versionToPersist)) {
              if (!persistedVersion) {
                log('Persisting new Version');
                Milestone.persist(versionToPersist);
              } else {
                log('Version already exists, only updating values');
                _.assign(persistedVersion, versionToPersist);
                return persistedVersion.save({ ignoreUnknownAttributes: true });
              }
            }
          })
          .then(() => log('indexing of project versions finished'));
      }),
    ]).then(() => log('Persisted %d new issues (%d already present)', persistCount, omitCount));
  }

  processComments(issue: any) {
    // to get comments also use api calls since they have pagination as well
    // log('processComments(%o)', issue);
    const issueKey = issue.key;
    const mentioned: string[] = [];
    issue = issue.fields;
    if (issue.comment.comments.total <= issue.comment.maxResults) {
      const comments = issue.comment.comments;

      comments.forEach((comment: any) => {
        comment.body.content.forEach((commentContent: any) => {
          commentContent.content.forEach((commentType: any) => {
            if (commentType.type === 'mention') {
              const mentionedUser = commentType.attrs.text;
              if (!mentioned.includes(mentionedUser)) {
                mentioned.push(mentionedUser);
              }
            }
          });
        });
      });
      return Promise.resolve(mentioned);
    } else {
      return this.jira
        .getComments(issueKey)
        .each(function (comment: any) {
          comment.body.content.forEach((commentContent: any) => {
            commentContent.content.forEach((commentType: any) => {
              if (commentType.type === 'mention') {
                const mentionedUser = commentType.attrs.text;
                if (!mentioned.includes(mentionedUser)) {
                  mentioned.push(mentionedUser);
                }
              }
            });
          });
        })
        .then(() => mentioned);
    }
  }

  stop() {
    log('stop()');
    this.stopping = true;
  }

  isStopping() {
    log('isStopping()');
    return this.stopping;
  }
}

export default JiraITSIndexer;
