'use strict';
import _ from 'lodash';
import Jira from '../../core/provider/jira';

import debug from 'debug';
import ConfigurationError from '../../errors/ConfigurationError';
import Milestone from '../../models/Milestone';
import Issue from '../../models/Issue';
import { JiraConfigType } from '../../types/jiraConfigType';
import {
  CommitDetail,
  CommitsFullDetail,
  CommitSummary,
  JiraChangelog,
  JiraFullAuthor,
  JiraIssueResponse,
  JiraChangelogItem,
  PullRequestDetail,
  PullRequestsSummary,
  JiraVersion,
  JiraWorklog,
  JiraComment,
} from '../../types/jiraRestApiTypes';
import { Mentions } from '../../types/issueTypes';
import ProgressReporter from '../../progress-reporter';

const log = debug('idx:its:jira');

class JiraITSIndexer {
  private repo: string;
  private stopping: boolean;
  private reporter: typeof ProgressReporter;
  private MENTIONED_REGEX = /\[~.+@.+\]/g;

  private jiraProject: string | undefined;
  private jira!: Jira;

  constructor(repo: string, reporter: any) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config: JiraConfigType) {
    //log('configure()', config);
    if (!config) {
      throw new ConfigurationError('Config is not set');
    }
    const options = {
      baseUrl: config.url,
      email: config?.username,
      privateToken: config?.token,
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
        .each((issue: JiraIssueResponse) => {
          if (this.stopping) {
            return false;
          }
          return this.jira
            .getDevelopmentSummary(issue.id)
            .then((developmentInformation: { commits: CommitSummary; pullrequests: PullRequestsSummary }) => {
              const mergeRequestPromise: Promise<any> = Promise.resolve();

              // if (developmentInformation.pullrequests && developmentInformation.pullrequests.overall.count !== 0) {
              //   mergeRequestPromise = this.jira
              //     .getDevelopmentDetails(issue.id, developmentInformation.pullrequests, true)
              //     .then((mergeRequests) => {
              //       const mergeRequestPromises = mergeRequests?.map((mergeRequest: PullRequestDetail) => {
              //         mergeRequest.id = mergeRequest.id.substring(1);
              //
              //         return (MergeRequest as any).findOneById(mergeRequest.id).then((persistedMergeRequest: any) => {
              //           // TODO: 2 issues share the same merge request then the ID of the merge request is equal and
              //           //  the other merge request will not be persisted because it is found in DB
              //           if (
              //             !persistedMergeRequest ||
              //             new Date(persistedMergeRequest.updatedAt).getTime() < new Date(mergeRequest.lastUpdate).getTime()
              //           ) {
              //             const toPersist = {
              //               id: mergeRequest.id,
              //               iid: parseInt(mergeRequest.id, 10),
              //               title: mergeRequest.name,
              //               // description: description, // this description is not the description
              //               // of the merge request in Github but of the issue in Jira
              //               state: mergeRequest.status,
              //               // createdAt: issue.fields.createdAt,
              //               updatedAt: mergeRequest.lastUpdate,
              //               // labels: NA
              //               // milestone: issue.fields.fixVersions.map((version: JiraVersion) => this.createVersionObject(version)),
              //               // this are versions of issue
              //               author: mergeRequest.author, // mergeRequest.author.name but it always displays name: User
              //               assignee: mergeRequest.reviewers.length > 0 ? mergeRequest.reviewers[0] : null,
              //               // this is assignee of issue in Jira
              //               assignees: mergeRequest.reviewers, // not sure if this is correct field
              //               // userNotesCount: NA
              //               // upvotes: issue.fields?.votes.votes ? issue.fields?.votes.votes : null,
              //               // this are the fields from the issue
              //               // downVotes: NA
              //               webUrl: mergeRequest.url,
              //               repositoryName: mergeRequest.repositoryName,
              //               repositoryUrl: mergeRequest.repositoryUrl,
              //               commentCount: mergeRequest.commentCount,
              //               // reference: NA,
              //               // references: NA,
              //               // timeStats: NA,
              //               // notes: NA,
              //             };
              //
              //             if (!persistedMergeRequest) {
              //               log('Persisting new mergeRequest');
              //               return (MergeRequest as any).persist(toPersist);
              //             } else {
              //               log('Updating persisted mergeRequest ' + mergeRequest.id);
              //               _.assign(persistedMergeRequest, toPersist);
              //               return persistedMergeRequest.save({
              //                 ignoreUnknownAttributes: true,
              //               });
              //             }
              //           } else {
              //             log('Omitting already persisted mergeRequest ' + mergeRequest.id);
              //           }
              //         });
              //       });
              //
              //       return Promise.all(mergeRequestPromises);
              //     })
              //     .then(() => this.reporter.finishMergeRequest());
              // }
              const issuePromise = (Issue as any)
                .findOneById(issue.id)
                .then((persistedIssue: any) => {
                  if (!persistedIssue || new Date(persistedIssue.updatedAt).getTime() < new Date(issue.fields.updated).getTime()) {
                    return this.jira.getCommitDetails(issue.id, developmentInformation.commits).then((linkedCommits) => {
                      const commits = this.buildMentions(linkedCommits);

                      const notesPromise = this.processWorklog(issue);
                      const commentsPromise = this.processComments(issue);
                      const changelogPromise = this.processChangelog(issue);

                      return Promise.all([notesPromise, commentsPromise, changelogPromise])
                        .then(([notes, data, changelog]) => {
                          const notes1 = this.createNotesObject(notes, data, changelog);
                          const assignee = this.getUpdatedUserObject(issue.fields.assignee);
                          const issueToSave = {
                            id: issue.id,
                            iid: parseInt(issue.fields.project.id + issue.key.split('-')[1], 10),
                            issuekey: issue.key,
                            title: issue.fields.summary,
                            description: issue.fields.description,
                            state: issue.fields.status.statusCategory.key,
                            url: issue.self,
                            closedAt: issue.fields.resolutiondate !== null ? new Date(issue.fields.resolutiondate).toISOString() : null,
                            createdAt: new Date(issue.fields.created).toISOString(),
                            updatedAt: new Date(issue.fields.updated).toISOString(),
                            labels: issue.fields.labels,
                            links: issue.fields.issuelinks,
                            milestone: issue.fields.fixVersions.map((version: JiraVersion) => this.createVersionObject(version)),
                            author: this.getUpdatedUserObject(issue.fields.reporter),
                            assignee: assignee,
                            assignees: assignee ? [assignee] : [],
                            upvotes: issue.fields.votes.votes,
                            // downVotes not available
                            dueDate: issue.fields.duedate,
                            // confidential: issue.security-level for this normal Jira software is needed, free version does not have that
                            weight: issue.fields?.customfield_10016 ? issue.fields?.customfield_10016 : null,
                            webUrl: issue.self.split('/rest/api')[0] + '/browse/' + issue.key,
                            subscribed: issue.fields.watches.watchCount,
                            mentions: commits,
                            notes:
                              !notes1.notesObjectsToReturn || notes1.notesObjectsToReturn.length === 0 ? [] : notes1.notesObjectsToReturn,

                            // BELOW FIELDS NOT IN MODEL

                            comments: data.comments,
                            priority: issue.fields.priority,
                            restrictions: issue.fields.issuerestriction,
                            issuetype: issue.fields.issuetype,
                            fullStatus: issue.fields.status,
                          };
                          if (!persistedIssue) {
                            log('Persisting new issue');
                            return (Issue as any).persist(issueToSave);
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
                        });
                    });
                  } else {
                    omitCount++;
                    log('Omitting already persisted issue ' + issue.id);
                  }
                })
                .then(() => this.reporter.finishIssue());

              return Promise.all([mergeRequestPromise, issuePromise]);
            });
        }),
      this.jira.getProjectVersions(this.jiraProject).each((projectVersion: JiraVersion) => {
        return (Milestone as any)
          .findOneById(projectVersion.id)
          .then((persistedVersion: any) => {
            const versionToPersist = this.createVersionObject(projectVersion);

            if (!persistedVersion || !_.isEqual(persistedVersion.data, versionToPersist)) {
              if (!persistedVersion) {
                //log('Persisting new version');
                return (Milestone as any).persist(versionToPersist);
              } else {
                //log('Updating persisted version ' + projectVersion.id);
                _.assign(persistedVersion, versionToPersist);
                return persistedVersion.save({
                  ignoreUnknownAttributes: true,
                });
              }
            } else {
              //log('Omitting already persisted version ' + projectVersion.id);
            }
          })
          .then(() => this.reporter.finishMilestone());
      }),
    ]).then((resp) => {
      return Promise.all(resp.flat()).then(() => log('Persisted %d new issues (%d already present)', persistCount, omitCount));
    });
  }

  private buildMentions(commitsObject: CommitsFullDetail[]) {
    if (commitsObject.length === 0) {
      return [];
    } else {
      const commits = commitsObject[0].commits;
      const returnObjects: Mentions[] = [];

      commits.forEach((commit: CommitDetail) => {
        returnObjects.push({
          commit: commit.id,
          createdAt: commit.authorTimestamp,
          closes: commit.merge,
          displayId: commit.displayId,
          author: commit.author,
        });
      });

      return returnObjects;
    }
  }

  private createVersionObject(projectVersion: JiraVersion) {
    let expired = projectVersion.overdue !== null ? projectVersion.overdue : null;
    const dueDate = projectVersion.releaseDate ? projectVersion.releaseDate : null;
    if (expired === null || expired === undefined) {
      expired = dueDate !== null ? new Date() > new Date(dueDate) : null;
    }

    return {
      id: projectVersion.id,
      iid: parseInt(projectVersion.projectId, 10), // no iid for version in Jira
      title: projectVersion.name,
      description: projectVersion.description ? projectVersion.description : null,
      dueDate: dueDate,
      startDate: projectVersion.startDate ? projectVersion.startDate : null,
      state: projectVersion.released ? 'active' : 'inactive',
      expired: expired, // TODO: check if this is correct if overdue is not set in response
    };
  }

  private populateDescription(description: any) {
    //log('populateDescription()', description);

    if (typeof description === 'string') {
      // for Jira version where API returns description as plain string
      return description ? description : null;
    }
    // here description is built as arrays of lines and content
    if (description.content.length === 0) {
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

  private processChangelog(issue: JiraIssueResponse) {
    const changelogInIssue = issue.changelog;
    let changelog: JiraChangelog[] = [];

    const allowedValues = ['timeestimate', 'timespent', 'WorklogId'];

    if (changelogInIssue.total <= changelogInIssue.maxResults) {
      changelogInIssue.histories.forEach((changelogEntry: JiraChangelog) => this.filterChangelog(changelogEntry, allowedValues, changelog));
      return Promise.resolve(changelog);
    } else {
      changelog = [];
      return this.jira
        .getChangelog(issue.key)
        .each((changelogEntry: JiraChangelog) => {
          this.filterChangelog(changelogEntry, allowedValues, changelog);
        })
        .then(() => changelog);
    }
  }

  private filterChangelog(changelogEntry: JiraChangelog, allowedValues: string[], changelog: JiraChangelog[]) {
    changelogEntry.items = changelogEntry.items.filter((item: JiraChangelogItem) => allowedValues.includes(item.field));
    if (changelogEntry.items.length > 0) {
      changelog.push(changelogEntry);
    }
  }

  private processWorklog(issue: JiraIssueResponse) {
    //log('processWorklog()');
    const worklogArray = issue.fields.worklog;
    if (worklogArray.total <= worklogArray.maxResults) {
      return Promise.resolve(worklogArray.worklogs);
    } else {
      const arrayToReturn: JiraWorklog[] = [];
      this.jira
        .getWorklog(issue.key)
        .each((worklog: JiraWorklog) => {
          arrayToReturn.push(worklog);
        })
        .then(() => arrayToReturn);
    }
  }

  private processComments(issue: JiraIssueResponse) {
    //log('processComments()', issue);
    const issueKey = issue.key;
    const mentioned: string[] = [];

    const issue_fields = issue.fields;
    const comments: JiraComment[] = issue_fields.comment.comments;
    if (issue_fields.comment.total <= issue_fields.comment.maxResults) {
      comments.forEach((comment: JiraComment) => {
        this.extractMentioned(comment, mentioned);
      });
      return Promise.resolve({ comments: comments, mentioned: mentioned });
    } else {
      const comments: JiraComment[] = [];
      return this.jira
        .getComments(issueKey)
        .each(
          function (comment: JiraComment) {
            comments.push(comment);
            this.extractMentioned(comment, mentioned);
          }.bind(this)
        )
        .then(() => {
          return { comments: comments, mentioned: mentioned };
        });
    }
  }

  private extractMentioned(comment: JiraComment, mentioned: string[]) {
    //log('extractMentioned()');
    if (typeof comment.body === 'string') {
      const ret = comment.body.match(this.MENTIONED_REGEX);
      if (ret !== null) {
        Array.prototype.push.apply(
          mentioned,
          ret.map((elem: string) => elem.substring(2, elem.length - 1))
        );
      }
    } else {
      comment.body.content.forEach((commentContent: any) => {
        this.extractFromContentArray(commentContent, mentioned);
      });
    }
  }

  private extractFromContentArray(commentContent: any, mentioned: string[]) {
    commentContent.content.forEach((commentType: any) => {
      if (commentType.type === 'mention') {
        const mentionedUser = commentType.attrs.text;
        if (!mentioned.includes(mentionedUser)) {
          mentioned.push(mentionedUser);
        }
      } else if (commentType.type === 'paragraph' && commentType.content) {
        commentType.content.forEach((contentType: any) => {
          if (contentType.type === 'mention') {
            const mentionedUser = contentType.attrs.text;
            if (!mentioned.includes(mentionedUser)) {
              mentioned.push(mentionedUser);
            }
          }
        });
      }
    });
  }

  private createNotesObject(
    notes: JiraWorklog[] | undefined,
    data: { comments: JiraComment[]; mentioned: string[] },
    changelog: JiraChangelog[]
  ) {
    const SECOND_POST_FIX = '2'; // TODO: change to "2" since this is used to identify as seconds

    const notesObjectsToReturn: any[] = [];
    const notesMentioned: string[] = [];
    if (notes) {
      notes.forEach((note: JiraWorklog) => {
        if (note.comment.content) {
          this.extractFromContentArray(note.comment, notesMentioned);
        }
      });
    }

    changelog.forEach((worklogEntry) => {
      const authorObject: JiraFullAuthor = worklogEntry.author;
      const user: string = worklogEntry.author.displayName;
      let isWorklogIdDeleted: null | boolean = null;
      let isTimeSpentSet: boolean | null = null;
      let workLogId: number | null = null;
      let from = -1;
      let to = -1;
      let entriesEqual = false;
      const created = worklogEntry.created;
      worklogEntry.items.forEach((item: JiraChangelogItem) => {
        if (item.field === 'timespent') {
          from = item.from ? parseInt(item.from, 10) : -1;
          to = item.to ? parseInt(item.to, 10) : -1;
          entriesEqual = from === to;
          isTimeSpentSet = true;
        }
        if (item.field === 'WorklogId') {
          isWorklogIdDeleted = item.from !== null && item.to === null;
          workLogId = item.to !== null ? parseInt(item.to) : parseInt(typeof item.from === 'string' ? item.from : '0');
        }
      });

      let body = '';
      if (isTimeSpentSet && workLogId && !entriesEqual) {
        if (isWorklogIdDeleted) {
          body = `deleted ${(from - (to !== -1 ? to : 0)) / 60}${SECOND_POST_FIX} of spent time ${user}`;
          //könnte zu viel sein was entfernt wird
        } else if (!isWorklogIdDeleted && to > from && to !== -1) {
          // from = from !== -1 ? from : 0;s
          body = `added ${(to - (from !== -1 ? from : 0)) / 60}${SECOND_POST_FIX} of time spent ${user}`;
          //removed some time
        } else if (!isWorklogIdDeleted && from > to && from !== -1) {
          body = `subtracted ${(from - (to !== -1 ? to : 0)) / 60}${SECOND_POST_FIX} of spent time ${user}`;
        }

        if (body !== '' && workLogId) {
          let objectToAdd: any;
          let notesWithComment: string | any[] = [];
          if (notes) {
            notesWithComment = notes.filter((note) => parseInt(note.id, 10) === workLogId);
          }
          if (notesWithComment.length > 1) {
            log('should not be case');
          } else if (notesWithComment.length === 1) {
            objectToAdd = structuredClone(notesWithComment[0]);
          } else {
            objectToAdd = { author: authorObject };
          }
          objectToAdd.body = body;
          objectToAdd.created_at = created;
          objectToAdd.worklogId = workLogId;
          objectToAdd.author = this.getUpdatedUserObject(objectToAdd.author);

          notesObjectsToReturn.push(objectToAdd);
        }
      }

      if (body !== '') {
        log('%s', body);
      }
    });

    const allMentioned: string[] = notesMentioned.concat(data.mentioned);

    return { notesObjectsToReturn, allMentioned };
  }

  private getUpdatedUserObject(userObject: JiraFullAuthor | null) {
    if (!userObject) {
      return null;
    }
    userObject.name = userObject.displayName;
    userObject.state = userObject.active ? 'active' : 'inactive';
    userObject.avatar_url = Object.values(userObject.avatarUrls)[0];
    userObject.web_url = userObject.self.split('/rest/api')[0] + '/jira/people/' + userObject.accountId;
    userObject.login = userObject.emailAddress;
    userObject.id = userObject.accountId;

    return userObject;
  }

  isStopping() {
    //log('isStopping()');
    return this.stopping;
  }
}

export default JiraITSIndexer;
