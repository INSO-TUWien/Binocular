'use strict';
import _ from 'lodash';
import Jira from '../../core/provider/jira';

import debug from 'debug';
import ConfigurationError from '../../errors/ConfigurationError';
import Milestone from '../../models/Milestone';
import Issue from '../../models/Issue';
import { JiraConfigType } from '../../types/jiraConfigType';
import {
  ChangelogType,
  JiraCommitsDetails,
  JiraChangelog,
  JiraComment,
  JiraFullAuthor,
  JiraIssue,
  JiraVersion,
  JiraWorklog,
} from '../../types/jiraRestApiTypes';
import { Mentions } from '../../types/issueTypes';
import ProgressReporter from '../../progress-reporter';
import MergeRequest from '../../models/MergeRequest';

const log = debug('idx:its:jira');

class JiraITSIndexer {
  private repo;
  private stopping;
  private reporter;
  private jiraProject!: string;
  private jira!: Jira;

  constructor(repo: string, reporter: typeof ProgressReporter) {
    this.repo = repo;
    this.stopping = false;
    this.reporter = reporter;
  }

  configure(config: JiraConfigType) {
    log('configure()', config);
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .on('count', (count: number) => this.reporter.setIssueCount(count))
        .each((issue: JiraIssue) => {
          if (this.stopping) {
            return false;
          }
          return this.jira.getDevelopmentSummary(issue.id).then((developmentInformation) => {
            const mergeRequestDetailsPromise = this.jira
              .getPullrequestDetails(issue.id, developmentInformation?.pullrequests)
              .then((mergeRequests) => {
                const mergeRequestPromises = mergeRequests?.map((mergeRequest) => {
                  mergeRequest.id = mergeRequest.id.substring(1);

                  // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  return MergeRequest.findOneById(mergeRequest.id).then((persistedMergeRequest) => {
                    // TODO: 2 issues share the same merge request then the ID of the merge request is equal and
                    //  the other merge request will not be persisted because it is found in DB
                    if (
                      !persistedMergeRequest ||
                      new Date(persistedMergeRequest.updatedAt).getTime() < new Date(mergeRequest.lastUpdate).getTime()
                    ) {
                      const toPersist = {
                        id: mergeRequest.id,
                        iid: parseInt(mergeRequest.id, 10),
                        title: mergeRequest.name,
                        // description: description, // this description is not the description
                        // of the merge request in Github but of the issue in Jira
                        state: mergeRequest.status,
                        // createdAt: issue.fields.createdAt,
                        updatedAt: mergeRequest.lastUpdate,
                        // labels: NA
                        // milestone: issue.fields.fixVersions.map((version: JiraVersion) => this.createVersionObject(version)),
                        // this are versions of issue
                        author: mergeRequest.author, // mergeRequest.author.name but it always displays name: User
                        assignee: mergeRequest.reviewers.length > 0 ? mergeRequest.reviewers[0] : null,
                        // this is assignee of issue in Jira
                        assignees: mergeRequest.reviewers, // not sure if this is correct field
                        // userNotesCount: NA
                        // upvotes: issue.fields?.votes.votes ? issue.fields?.votes.votes : null,
                        // this are the fields from the issue
                        // downVotes: NA
                        webUrl: mergeRequest.url,
                        repositoryName: mergeRequest.repositoryName,
                        repositoryUrl: mergeRequest.repositoryUrl,
                        commentCount: mergeRequest.commentCount,
                        // reference: NA,
                        // references: NA,
                        // timeStats: NA,
                        // notes: NA,
                      };

                      if (!persistedMergeRequest) {
                        log('Persisting new mergeRequest');

                        // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
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
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .then(() => this.reporter.finishMergeRequest());

            // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const issuePromise = Issue.findOneById(issue.id)
              // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              .then((persistedIssue) => {
                if (!persistedIssue || new Date(persistedIssue.updatedAt).getTime() < new Date(issue.fields.updated).getTime()) {
                  return this.jira.getCommitDetails(issue.id, developmentInformation?.commits).then((linkedCommits) => {
                    const commits = this.buildMentions(linkedCommits);

                    const notesPromise = this.processWorklog(issue);
                    const commentsPromise = this.processComments(issue);
                    const changelogPromise = this.processChangelog(issue);

                    return Promise.all([notesPromise, commentsPromise, changelogPromise])
                      .then(([worklogs, comments, changelogs]) => {
                        const notesToPersist = this.createNotesObject(worklogs, changelogs);
                        const assigneeToPersist = this.getUpdatedUserObject(issue.fields.assignee);
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
                          assignee: assigneeToPersist,
                          assignees: assigneeToPersist ? [assigneeToPersist] : [],
                          upvotes: issue.fields.votes.votes,
                          // downVotes not available
                          dueDate: issue.fields.duedate,
                          // confidential: issue.security-level for this normal Jira software is needed, free version does not have that
                          weight: issue.fields?.customfield_10016 ? issue.fields?.customfield_10016 : null,
                          webUrl: issue.self.split('/rest/api')[0] + '/browse/' + issue.key,
                          subscribed: issue.fields.watches.watchCount,
                          mentions: commits,
                          notes: notesToPersist,

                          // BELOW FIELDS NOT IN MODEL

                          comments: comments,
                          priority: issue.fields.priority,
                          restrictions: issue.fields.issuerestriction,
                          issuetype: issue.fields.issuetype,
                          fullStatus: issue.fields.status,
                          originalWorklog: worklogs,
                        };
                        if (!persistedIssue) {
                          log('Persisting new issue');
                          // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
                          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                          // @ts-expect-error
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
                      });
                  });
                } else {
                  omitCount++;
                  log('Omitting already persisted issue ' + issue.id);
                }
              })
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .then(() => this.reporter.finishIssue());

            return Promise.all([mergeRequestDetailsPromise, issuePromise]);
          });
        }),
      this.jira.getProjectVersions(this.jiraProject).each((projectVersion: JiraVersion) => {
        return (
          // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          Milestone.findOneById(projectVersion.id)
            // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            .then((persistedVersion) => {
              const versionToPersist = this.createVersionObject(projectVersion);

              if (!persistedVersion || !_.isEqual(persistedVersion.data, versionToPersist)) {
                if (!persistedVersion) {
                  log('Persisting new version');
                  // TODO: Currently necessary because the implementation of the Models isn't really compatible with typescript.
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .then(() => this.reporter.finishMilestone())
        );
      }),
    ]).then((resp) => {
      return Promise.all(resp.flat()).then(() => log('Persisted %d new issues (%d already present)', persistCount, omitCount));
    });
  }

  private buildMentions(commitsObject: JiraCommitsDetails[]) {
    if (commitsObject.length === 0) {
      return [];
    } else {
      const mentionsResult: Mentions[] = [];
      commitsObject.forEach((commitInstanceObject) => {
        const commits = commitInstanceObject.commits;

        commits.forEach((commit) => {
          mentionsResult.push({
            commit: commit.id,
            createdAt: commit.authorTimestamp,
            closes: commit.merge,
            displayId: commit.displayId,
            author: commit.author,
          });
        });
      });
      return mentionsResult;
    }
  }

  private createVersionObject(projectVersion: JiraVersion) {
    let expired = projectVersion.overdue !== undefined ? projectVersion.overdue : null;
    const dueDate = projectVersion.releaseDate ? projectVersion.releaseDate : null;
    if (expired === null) {
      expired = dueDate !== null ? new Date() > new Date(dueDate) : null;
    }

    return {
      id: projectVersion.id,
      iid: parseInt(projectVersion.projectId + projectVersion.id, 10),
      title: projectVersion.name,
      description: projectVersion.description ? projectVersion.description : null,
      dueDate: dueDate,
      startDate: projectVersion.startDate ? projectVersion.startDate : null,
      state: projectVersion.released ? 'active' : 'inactive',
      expired: expired, // TODO: check if this is correct if overdue is not set in response
    };
  }

  private processChangelog(issue: JiraIssue): Promise<JiraChangelog[]> {
    const issueChangelogs = issue.changelog;
    let changelogs: JiraChangelog[] = [];

    const allowedValues = ['timeestimate', 'timespent', 'WorklogId'];

    if (issueChangelogs.total <= issueChangelogs.maxResults) {
      issueChangelogs.histories.forEach((changelogEntry) => {
        changelogs = changelogs.concat(this.filterChangelog(changelogEntry, allowedValues));
      });
      return Promise.resolve(changelogs);
    } else {
      return this.jira
        .getChangelog(issue.key)
        .each((changelogEntry: JiraChangelog) => {
          changelogs = changelogs.concat(this.filterChangelog(changelogEntry, allowedValues));
        })
        .then(() => changelogs);
    }
  }

  private filterChangelog(changelogEntry: JiraChangelog, allowedValues: string[]) {
    const changelogs: JiraChangelog[] = [];
    changelogEntry.items = changelogEntry.items.filter((item) => allowedValues.includes(item.field));
    if (changelogEntry.items.length > 0) {
      changelogs.push(changelogEntry);
    }

    return changelogs;
  }

  private processWorklog(issue: JiraIssue): Promise<JiraWorklog[]> {
    log('processWorklog()');
    const issueWorklogs = issue.fields.worklog;
    if (issueWorklogs.total <= issueWorklogs.maxResults) {
      return Promise.resolve(issueWorklogs.worklogs);
    } else {
      const worklogsToReturn: JiraWorklog[] = [];
      return this.jira
        .getWorklog(issue.key)
        .each((worklog: JiraWorklog) => {
          worklogsToReturn.push(worklog);
        })
        .then(() => worklogsToReturn);
    }
  }

  private processComments(issue: JiraIssue): Promise<JiraComment[]> {
    log('processComments()', issue);
    const issueComments = issue.fields.comment;
    if (issueComments.total <= issueComments.maxResults) {
      return Promise.resolve(issueComments.comments);
    } else {
      const comments: JiraComment[] = [];
      return this.jira
        .getComments(issue.key)
        .each(
          function (comment: JiraComment) {
            comments.push(comment);
          }.bind(this)
        )
        .then(() => {
          return comments;
        });
    }
  }

  private createNotesObject(jiraWorklogs: JiraWorklog[], jiraChangelogs: JiraChangelog[]) {
    const SECONDS_POST_FIX = '2';

    const notes: ChangelogType[] = [];
    jiraChangelogs.forEach((jiraChangelog) => {
      const authorObject = jiraChangelog.author;
      let isWorklogIdDeleted: null | boolean = null;
      let isTimeSpentSet: boolean | null = null;
      let workLogId: number | null = null;
      let from = -1;
      let to = -1;
      let entriesEqual = false;
      const created = jiraChangelog.created;
      jiraChangelog.items.forEach((changelogItem) => {
        if (changelogItem.field === 'timespent') {
          from = changelogItem.from ? parseInt(changelogItem.from, 10) : -1;
          to = changelogItem.to ? parseInt(changelogItem.to, 10) : -1;
          entriesEqual = from === to;
          isTimeSpentSet = true;
        }
        if (changelogItem.field === 'WorklogId') {
          isWorklogIdDeleted = changelogItem.from !== null && changelogItem.to === null;
          workLogId =
            changelogItem.to !== null
              ? parseInt(changelogItem.to)
              : parseInt(typeof changelogItem.from === 'string' ? changelogItem.from : '0');
        }
      });

      let body = '';
      if (isTimeSpentSet && workLogId && !entriesEqual) {
        let timeSpentSeconds = -1;
        if (isWorklogIdDeleted) {
          timeSpentSeconds = from - (to !== -1 ? to : 0);
          body = `deleted ${timeSpentSeconds}${SECONDS_POST_FIX} of spent time`;
          timeSpentSeconds = timeSpentSeconds * -1;
          //könnte zu viel sein was entfernt wird
        } else if (!isWorklogIdDeleted && to > from && to !== -1) {
          // from = from !== -1 ? from : 0;s
          timeSpentSeconds = to - (from !== -1 ? from : 0);
          body = `added ${timeSpentSeconds}${SECONDS_POST_FIX} of time spent`;
          //removed some time
        } else if (!isWorklogIdDeleted && from > to && from !== -1) {
          timeSpentSeconds = from - (to !== -1 ? to : 0);
          body = `subtracted ${timeSpentSeconds}${SECONDS_POST_FIX} of time spent`;
          timeSpentSeconds = timeSpentSeconds * -1;
        }

        if (body !== '' && workLogId) {
          let noteToAdd: any;
          const worklogsMatchingId = jiraWorklogs.filter((jiraWorklog) => parseInt(jiraWorklog.id, 10) === workLogId);

          if (worklogsMatchingId.length > 1) {
            log('should not be case');
          } else if (worklogsMatchingId.length === 1) {
            noteToAdd = structuredClone(worklogsMatchingId[0]);
          } else {
            noteToAdd = { author: authorObject };
          }
          noteToAdd.body = body;
          noteToAdd.created_at = created;
          noteToAdd.worklogId = workLogId;
          noteToAdd.timeSpentSeconds = timeSpentSeconds;
          noteToAdd.timeSpent = timeSpentSeconds / 60 + 'm';
          noteToAdd.author = this.getUpdatedUserObject(noteToAdd.author);

          notes.push(noteToAdd);
        }
      }

      if (body !== '') {
        log('%s', body);
      }
    });

    return notes;
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
    log('isStopping()');
    return this.stopping;
  }
}

export default JiraITSIndexer;
