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
    return Promise.resolve();
  }

  index() {
    log('index()');
    let omitCount = 0;
    let persistCount = 0;

    return Promise.all([
      this.jira
        .getIssuesWithJQL('project=' + this.jiraProject)
        .on('count', (count: number) => this.reporter.setIssueCount(count))
        .each((issue: any) => {
          if (this.stopping) {
            return false;
          }

          issue.id = issue.id.toString();
          const description = issue.fields.description?.content ? this.populateDescription(issue.fields.description.content) : null;

          return this.jira.getMergeRequest(issue.id).then((mergeRequests: any) => {
            mergeRequests?.map((mergeRequest: any) => {
              mergeRequest.id = mergeRequest.id.substring(1);
              const toPersist = {
                id: mergeRequest.id,
                iid: issue.key,
                title: mergeRequest.name,
                description: description,
                state: mergeRequest.status,
                url: issue.self,
                closedAt: issue.fields.resolutiondate,
                createdAt: issue.fields.createdAt,
                updatedAt: mergeRequest.lastUpdate,
                upvotes: issue.fields?.votes.votes, // this are the fields from the issue
                weight: issue.fields?.customfield_10016, //this field is used for the storypoints,
                watches: issue.fields.watches.watchCount,
                labels: issue.fields.labels,
                milestone: issue.milestone,
                author: issue.fields.creator.displayName, // mergeRequest.author.name but it always displays name: User
                assignee: issue.fields?.assignee?.displayName, // there can't be multiple assinges
                assignees: mergeRequest.reviewers,
                webUrl: mergeRequest.url,
              };

              MergeRequest.findOneById(toPersist.id).then((persistedMergeRequest: any) => {
                if (
                  !persistedMergeRequest ||
                  new Date(persistedMergeRequest.updatedAt).getTime() < new Date(mergeRequest.lastUpdate).getTime()
                ) {
                  if (!persistedMergeRequest) {
                    log('Persisting new Mergerequest');
                    MergeRequest.persist(toPersist);
                  } else {
                    log('Mergerequest already exists, only updating values');
                    _.assign(persistedMergeRequest, toPersist);
                    persistedMergeRequest.save({ ignoreUnknownAttributes: true });
                  }
                } else {
                  log('Omitting already persisted mergeRequest');
                }
              });
              // .then(() => this.reporter.finishMergeRequest());
              // });
            });
            return Issue.findOneById(issue.id)
              .then((persistedIssue: any) => {
                if (!persistedIssue || new Date(persistedIssue.updatedAt).getTime() < new Date(issue.fields.updated).getTime()) {
                  return this.processComments(issue)
                    .then((mentioned: any) => {
                      const description = issue.fields.description?.content
                        ? this.populateDescription(issue.fields.description.content)
                        : null;
                      const issueToSave = {
                        id: issue.id,
                        iid: issue.key,
                        title: issue.fields.summary,
                        description: description,
                        state: issue.fields.status.statusCategory.key,
                        url: issue.self,
                        closedAt: issue.fields.resolutiondate,
                        createdAt: issue.fields.createdAt,
                        updatedAt: issue.fields.updated,
                        labels: issue.fields.labels,
                        milestone: issue.fixVersions,
                        author: issue.fields.creator.displayName,
                        assignee: issue.fields?.assignee?.displayName, // there can't be multiple assinges
                        // assignees: issue.assignees, not available in Jira
                        upvotes: issue.fields?.votes.votes,
                        // downVotes not available
                        dueDate: issue.fields?.dueDate,
                        // confidential: issue.security-level for this normal Jira software is needed, free version does not have that
                        weight: issue.fields?.customfield_10016, //this field is used for the storypoints, could be problematic,
                        // if having for example this in custom fields
                        webUrl: issue.self.split('/rest/api')[0] + '/browse/' + issue.key,
                        subscribed: issue.fields.watches.watchCount,
                        mentions: mentioned,
                        // notes: not found
                      };
                      if (!persistedIssue) {
                        // persistCount++;
                        log('Persisting new issue ' + persistCount);
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        return Issue.persist(issueToSave);
                      } else {
                        // persistCount++;
                        log('Issue already exists, only updating values');
                        _.assign(persistedIssue, issueToSave);
                        return persistedIssue.save({
                          ignoreUnknownAttributes: true,
                        });
                      }
                    })
                    .then(() => {
                      persistCount++;
                      log('persistCount: ' + persistCount);
                    });
                } else {
                  omitCount++;
                  log('Omitted issue ' + omitCount);
                }
              })
              .then(() => this.reporter.finishIssue());
            // });
          });
        }),
      this.jira.getProjectVersions(this.jiraProject).each((projectVersion: any) => {
        projectVersion.id = projectVersion.id.toString();
        return Milestone.findOneById(projectVersion.id)
          .then((persistedVersion: any) => {
            const versionToPersist = {
              id: projectVersion.id, // problem is here that when using multiple projects, the versions could have the same ID,
              // but being in a different project
              iid: projectVersion.projectId,
              title: projectVersion.name,
              description: projectVersion.description,
              dueDate: projectVersion.releaseDate,
              startDate: projectVersion.startDate,
              state: projectVersion.released ? 'released' : 'unreleased',
              expired: !projectVersion.overdue ? false : projectVersion.overdue, // could maybe not be true,
              // but api does not return overdue if it is released
            };
            if (!persistedVersion || !_.isEqual(persistedVersion, versionToPersist)) {
              if (!persistedVersion) {
                log('Persisting new Version');
                return Milestone.persist(versionToPersist);
              } else {
                log('Version already exists, only updating values');
                _.assign(persistedVersion, versionToPersist);
                return persistedVersion.save({ ignoreUnknownAttributes: true });
              }
            } else {
              return Promise.resolve();
            }
          })
          .then(() => this.reporter.finishMilestone());
      }),
    ]).then((resp) => {
      return Promise.all(resp.flat()).then(() => log('Persisted %d new issues (%d already present)', persistCount, omitCount));
    });
  }

  populateDescription(content: any) {
    if (content === 0) {
      return null;
    }

    let descriptionAsString = '';

    content.forEach((line: any) => {
      if (line.type === 'paragraph') {
        line.content.forEach((actualContent: any) => {
          if (actualContent.type === 'text') {
            descriptionAsString += actualContent.text;
          }
        });
        descriptionAsString += '\n';
      }
    });

    return descriptionAsString;
  }

  processComments(issue: any) {
    log('processComments()');
    const issueKey = issue.key;
    const mentioned: string[] = [];

    issue = issue.fields;
    const comments = issue.comment.comments;
    if (issue.comment.total <= issue.comment.maxResults) {
      comments.forEach((comment: any) => {
        this.extractMentioned(comment, mentioned);
      });
      return Promise.resolve(mentioned);
    } else {
      return this.jira
        .getComments(issueKey)
        .each(
          function (comment: any) {
            this.extractMentioned(comment, mentioned);
          }.bind(this)
        )
        .then(() => mentioned);
    }
  }

  private extractMentioned(comment: any, mentioned: string[]) {
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
  }

  isStopping() {
    log('isStopping()');
    return this.stopping;
  }
}

export default JiraITSIndexer;
