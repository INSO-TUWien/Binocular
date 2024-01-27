'use strict';
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
  private MENTIONED_REGEX = /\[~.+@.+\]/g;

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

    return Promise.all([
      this.jira
        .getIssuesWithJQL('project=' + this.jiraProject)
        .on('count', (count: number) => this.reporter.setIssueCount(count))
        .each((issue: any) => {
          if (this.stopping) {
            return false;
          }

          issue.id = issue.id.toString();
          const description = this.populateDescription(issue.fields.description);

          const mergeRequestPromise = this.jira
            .getMergeRequest(issue.id)
            .then((mergeRequests: any) => {
              const mergeRequestPromises = mergeRequests?.map((mergeRequest: any) => {
                mergeRequest.id = mergeRequest.id.substring(1);

                return MergeRequest.findOneById(mergeRequest.id).then((persistedMergeRequest: any) => {
                  // TODO: 2 issues share the same merge request then the ID of the merge request is equal and
                  //  the other merge request will not be persisted because it is found in DB
                  if (
                    !persistedMergeRequest ||
                    new Date(persistedMergeRequest.updatedAt).getTime() < new Date(mergeRequest.lastUpdate).getTime()
                  ) {
                    const toPersist = {
                      id: mergeRequest.id,
                      iid: issue.key,
                      title: mergeRequest.name,
                      description: description, // this description is not the description
                      // of the merge request in Github but of the issue in Jira
                      state: mergeRequest.status,
                      createdAt: issue.fields.createdAt,
                      updatedAt: mergeRequest.lastUpdate,
                      labels: issue.fields.labels, // this are labels of issue
                      milestone: issue.fixVersions, // this are versions of issue
                      author: issue.fields.creator.displayName, // mergeRequest.author.name but it always displays name: User
                      assignee: issue.fields?.assignee?.displayName, // this is assignee of issue in Jira
                      assignees: mergeRequest.reviewers, // not sure if this is correct field
                      // userNotesCount: NA
                      upvotes: issue.fields?.votes.votes, // this are the fields from the issue
                      // downVotes: NA
                      webUrl: mergeRequest.url,
                      // reference: NA,
                      // references: NA,
                      // timeStats: NA,
                      // notes: NA,
                    };

                    if (!persistedMergeRequest) {
                      log('Persisting new mergeRequest');
                      return MergeRequest.persist(toPersist);
                    } else {
                      log('Updating persisted mergeRequest ' + mergeRequest.id);
                      _.assign(persistedMergeRequest, toPersist);
                      return persistedMergeRequest.save({
                        ignoreUnknownAttributes: true,
                      });
                    }
                  } else {
                    log('Omitting already persisted mergeRequest ' + mergeRequest.id);
                  }
                });
              });

              return Promise.all(mergeRequestPromises);
            })
            .then(() => this.reporter.finishMergeRequest());
          const issuePromise = Issue.findOneById(issue.id)
            .then((persistedIssue: any) => {
              if (!persistedIssue || new Date(persistedIssue.updatedAt).getTime() < new Date(issue.fields.updated).getTime()) {
                return this.processComments(issue)
                  .then((mentioned: any) => {
                    const issueToSave = {
                      id: issue.id,
                      iid: issue.key,
                      title: issue.fields.summary,
                      description: description,
                      state: issue.fields.status.statusCategory.key,
                      url: issue.self,
                      closedAt: issue.fields.resolutiondate,
                      createdAt: issue.fields.created,
                      updatedAt: issue.fields.updated,
                      labels: issue.fields.labels,
                      milestone: issue.fixVersions, //to check if this is the correct-used field
                      author: issue.fields.creator.displayName, // display name or email address?
                      assignee: issue.fields?.assignee?.displayName, // there can't be multiple assinges
                      // assignees: issue.assignees, not available in Jira
                      upvotes: issue.fields?.votes.votes,
                      // downVotes not available
                      dueDate: issue.fields?.dueDate,
                      // confidential: issue.security-level for this normal Jira software is needed, free version does not have that
                      weight: issue.fields?.customfield_10016, //this field is used for the storypoints, could be problematic,
                      // if having for example this in custom fields
                      webUrl: issue.self.split('/rest/api')[0] + '/browse/' + issue.key,
                      subscribed: issue.fields.watches?.watchCount,
                      mentions: mentioned,
                      // notes: NA
                    };
                    if (!persistedIssue) {
                      log('Persisting new issue');
                      return Issue.persist(issueToSave);
                    } else {
                      log('Updating persisted issue ' + issue.id);
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
                log('Omitting already persisted issue ' + issue.id);
              }
            })
            .then(() => this.reporter.finishIssue());

          return Promise.all([mergeRequestPromise, issuePromise]);
        }),
      this.jira.getProjectVersions(this.jiraProject).each((projectVersion: any) => {
        projectVersion.id = projectVersion.id.toString();
        return Milestone.findOneById(projectVersion.id)
          .then((persistedVersion: any) => {
            const versionToPersist = {
              id: projectVersion.id,
              iid: projectVersion.projectId, // no iid for version in Jira
              title: projectVersion.name,
              description: projectVersion.description,
              dueDate: projectVersion.releaseDate,
              startDate: projectVersion.startDate,
              state: projectVersion.released ? 'active' : 'inactive',
              expired: !projectVersion.overdue ? false : projectVersion.overdue, // could maybe not be true,
              // but api does not return overdue if it is released
            };
            if (!persistedVersion || !_.isEqual(persistedVersion, versionToPersist)) {
              if (!persistedVersion) {
                log('Persisting new version');
                return Milestone.persist(versionToPersist);
              } else {
                log('Updating persisted version ' + projectVersion.id);
                _.assign(persistedVersion, versionToPersist);
                return persistedVersion.save({
                  ignoreUnknownAttributes: true,
                });
              }
            } else {
              log('Omitting already persisted version ' + projectVersion.id);
            }
          })
          .then(() => this.reporter.finishMilestone());
      }),
    ]).then((resp) => {
      return Promise.all(resp.flat()).then(() => log('Persisted %d new issues (%d already present)', persistCount, omitCount));
    });
  }

  private populateDescription(description: any) {
    log('populateDescription(%o)', description);

    if (typeof description === 'string') {
      // for Jira version where API returns description as plain string
      return description ? description : null;
    }
    // here description is built as arrays of lines and content
    if (description === 0) {
      return null;
    }
    let descriptionAsString = '';

    description.content.forEach((line: any) => {
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

  private processComments(issue: any) {
    log('processComments(%o)', issue);
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
    log('extractMentioned()');
    if (typeof comment.body === 'string') {
      Array.prototype.push.apply(
        mentioned,
        comment.body.match(this.MENTIONED_REGEX).map((elem: string) => elem.substring(2, elem.length - 1))
      );
    } else {
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
  }

  isStopping() {
    log('isStopping()');
    return this.stopping;
  }
}

export default JiraITSIndexer;
