'use strict';

import _ from 'lodash';
import debug from 'debug';
import Issue from '../../models/models/Issue';
import MergeRequest from '../../models/models/MergeRequest';
import Milestone from '../../models/models/Milestone';
import BaseGitLabIndexer from '../BaseGitLabIndexer';
import Account from '../../models/models/Account';
import IssueAccountConnection from '../../models/connections/IssueAccountConnection';
import MergeRequestAccountConnection from '../../models/connections/MergeRequestAccountConnection';
import IssueMilestoneConnection from '../../models/connections/IssueMilestoneConnection';
import MergeRequestMilestoneConnection from '../../models/connections/MergeRequestMilestoneConnection';
import Note from '../../models/models/Note';
import NoteAccountConnection from '../../models/connections/NoteAccountConnection';
import IssueNoteConnection from '../../models/connections/IssueNoteConnection';
import MergeRequestNoteConnection from '../../models/connections/MergeRequestNoteConnection';
import ReviewThread from '../../models/models/ReviewThread';
import ReviewThreadCommentConnection from '../../models/connections/ReviewThreadCommentConnection';
import MergeRequestCommentConnection from '../../models/connections/MergeRequestCommentConnection';
import Comment from '../../models/models/Comment';
import ReviewThreadAccountConnection from '../../models/connections/ReviewThreadAccountConnection';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let omitMilestoneCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let persistMilestoneCount = 0;

    // get the gitlab project
    const project = await this.getProject();

    // STEP 1: save all milestones
    const milestoneEntries = [];
    await this.gitlab.getMileStones(project.id).collect(async (ms) => {
      for (const milestone of ms) {
        let entry;
        const existingMilestone = await Milestone.findOneByExample({ id: milestone.id });
        const mileStoneData = _.merge(_.mapKeys(milestone, (v, k) => _.camelCase(k)));

        if (!existingMilestone || new Date(existingMilestone.updatedAt).getTime() < new Date(milestone.updated_at).getTime()) {
          log('Processing mergeRequest #' + milestone.iid);
          entry = (await Milestone.persist(mileStoneData))[0];
          persistMilestoneCount++;
        } else {
          _.assign(existingMilestone, mileStoneData);
          omitMilestoneCount++;
          entry = await Milestone.save(existingMilestone);
        }

        this.reporter.finishMilestone();

        // return the milestone entry (either the newly persisted one or the old one)
        milestoneEntries.push(entry);
      }
    });

    // now we have the entries for all milestones, store them in a map so we can access them by their iid
    const milestonesByIid = {};

    milestoneEntries.map((ms) => {
      milestonesByIid[ms.data.iid] = ms;
    });

    // STEP 2: persist issues and merge requests
    // we use the milestone entries to connect issues and merge requests to their respective milestones.
    // Note: this has to happen sequentially since both issues and milestones create Account entries in the db.
    //       If we wrap this in a Promise.all, it could happen that two identical account entries are created in the database.
    await this.gitlab
      .getIssues(project.id)
      .on('count', (count) => this.reporter.setIssueCount(count))
      .collect(async (issues) => {
        // collect all issues and process them one by one
        for (const issue of issues) {
          if (this.stopping) {
            return false;
          }

          // for each issue, check if it already exists
          const existingIssue = await Issue.findOneByExample({ id: String(issue.id) });

          let issueEntry = existingIssue;

          // first, persist the author/assignees associated to this issue
          const authorEntry = (await Account.ensureGitLabAccount(issue.author))[0];
          const assigneesEntries = [];
          for (const assignee of issue.assignees) {
            assigneesEntries.push((await Account.ensureGitLabAccount(assignee))[0]);
          }

          // array that stores the persisted notes in order to connect them to the issue later on
          let noteEntries = [];

          // if the issue is not yet persisted or has been updated since it has last been persisted, process it
          if (!existingIssue || new Date(existingIssue.updatedAt).getTime() < new Date(issue.updated_at).getTime()) {
            log('Processing issue #' + issue.iid);
            // first, get the mentioned commits and notes (used for time-tracking data)
            const results = await this.processComments(project, issue);
            const mentions = results[0];
            const closedAt = results[1];
            const notes = results[2];
            let issueData = _.merge(
              _.mapKeys(issue, (v, k) => _.camelCase(k)),
              {
                mentions,
                closedAt,
              },
            );

            // process notes
            noteEntries = await this.processNotes(notes);

            // store the milestone this issue belongs to separately
            const milestoneIid = issueData.milestone?.iid;

            const mapKeys = {
              project_id: 'projectId',
              created_at: 'createdAt',
              updated_at: 'updatedAt',
              closed_at: 'closedAt',
              web_Url: 'webUrl',
              time_stats: 'timeStats',
            };

            const mappedIssueData = _.mapKeys(issueData, (value, key) => mapKeys[key] || key);

            // only keep properties as defined in the IssueDto interface
            issueData = _.pick(mappedIssueData, [
              'id',
              'iid',
              'title',
              'description',
              'createdAt',
              'closedAt',
              'updatedAt',
              'labels',
              'state',
              'webUrl',
              'projectId',
              'timeStats',
              'mentions',
            ]);

            // if this is a new issue, persist it
            if (!existingIssue) {
              issueEntry = (await Issue.persist(issueData))[0];
            } else {
              // if this issue already exists, update its fields and save
              _.assign(existingIssue, issueData);
              issueEntry = await Issue.save(existingIssue);
            }

            if (milestoneIid !== null && milestoneIid !== undefined) {
              await this.connectIssuesToMilestones(IssueMilestoneConnection, issueEntry, milestonesByIid[milestoneIid]);
            }

            persistCount++;
          } else {
            log('Skipping issue #' + issue.iid);
            omitCount++;
          }

          // connect issue to accounts and notes
          await this.connectIssuesToUsers(IssueAccountConnection, issueEntry, authorEntry, assigneesEntries);
          await this.connectIssuesToNotes(IssueNoteConnection, issueEntry, noteEntries);
          this.reporter.finishIssue();
        }
      });

    await this.gitlab.getMergeRequests(project.id).collect(async (mergeRequests) => {
      for (const mergeRequest of mergeRequests) {
        const existingMergeRequest = await MergeRequest.findOneByExample({ id: `${mergeRequest.id}` });

        // first, persist the author/assignees associated to this MR
        const authorEntry = (await Account.ensureGitLabAccount(mergeRequest.author))[0];
        const assigneesEntries = [];
        for (const assignee of mergeRequest.assignees) {
          assigneesEntries.push((await Account.ensureGitLabAccount(assignee))[0]);
        }

        let mrEntry = existingMergeRequest;

        // array that stores the persisted notes in order to connect them to the issue later on
        let noteEntries = [];

        if (!existingMergeRequest || new Date(existingMergeRequest.updatedAt).getTime() < new Date(mergeRequest.updated_at).getTime()) {
          log('Processing mergeRequest #' + mergeRequest.iid);
          await this.processMergeRequestNotes(project, mergeRequest)
            .then(async (notes) => {
              noteEntries = await this.processNotes(notes);

              // store the milestone this issue belongs to separately
              const milestoneIid = mergeRequest.milestone?.iid;

              const mapKeys = {
                project_id: 'projectId',
                created_at: 'createdAt',
                updated_at: 'updatedAt',
                closed_at: 'closedAt',
                web_Url: 'webUrl',
              };

              const mappedMergeRequestData = _.mapKeys(mergeRequest, (value, key) => mapKeys[key] || key);

              // only keep properties from MergeRequestDto
              const mergeRequestDto = _.pick(mappedMergeRequestData, [
                'id',
                'iid',
                'title',
                'description',
                'createdAt',
                'closedAt',
                'updatedAt',
                'labels',
                'state',
                'webUrl',
                'projectId',
                'mentions',
              ]);
              if (!existingMergeRequest) {
                mrEntry = (await MergeRequest.persist(mergeRequestDto))[0];
              } else {
                _.assign(existingMergeRequest, mergeRequestDto);
                mrEntry = await MergeRequest.save(existingMergeRequest);
              }
              if (milestoneIid !== null && milestoneIid !== undefined) {
                await this.connectIssuesToMilestones(MergeRequestMilestoneConnection, mrEntry, milestonesByIid[milestoneIid]);
              }
            })
            .then(() => persistMergeRequestCount++)
            .then(async () => {
              await this.processMergeRequestDiscussions(project, mergeRequest).then((discussions) => {
                Promise.all(
                  discussions.map((discussion) => {
                    return new Promise(() => {
                      return ReviewThread.findOneByExample({ id: String(discussion.id) }).then(async (existingReviewThread) => {
                        let isReviewThread = false;
                        let parentEntry = mrEntry;
                        if (discussion.notes.nodes[0].position) {
                          isReviewThread = true;
                          parentEntry = await this.persistReviewThread(discussion, existingReviewThread);
                        }

                        Promise.all(
                          discussion.notes.nodes.map((note) => {
                            this.persistComment(note, isReviewThread, parentEntry);
                          }),
                        );
                      });
                    });
                  }),
                );
              });
            });
        } else {
          log('Skipping mergeRequest #' + mergeRequest.iid);
          omitMergeRequestCount++;
        }
        await this.connectIssuesToUsers(MergeRequestAccountConnection, mrEntry, authorEntry, assigneesEntries);
        await this.connectIssuesToNotes(MergeRequestNoteConnection, mrEntry, noteEntries);
        this.reporter.finishMergeRequest();
      }
    });
    log('Persisted %d new issues (%d already present)', persistCount, omitCount);
  }

  async processComments(project, issue) {
    let closedAt;
    const mentions = [];
    const notes = [];
    return await this.gitlab
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

  async processMergeRequestNotes(project, mergeRequest) {
    const notes = [];
    return await this.gitlab
      .getMergeRequestNotes(project.id, mergeRequest.iid)
      .each((note) => {
        notes.push(note);
      })
      .then(() => notes);
  }

  processMergeRequestDiscussions(project, mergeRequest) {
    return this.gitlab.getMergeRequestDiscussions(project.path_with_namespace, mergeRequest.iid).then((response) => {
      const discussions = [];
      _.each(response, (discussion) => {
        discussions.push(discussion);
      });
      return discussions;
    });
  }

  isStopping() {
    return this.stopping;
  }

  processNotes = async (notes) => {
    const noteEntries = [];
    for (const note of notes) {
      const newNote = {
        id: note.id,
        body: note.body,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        system: note.system,
        resolvable: note.resolvable,
        confidential: note.confidential,
        internal: note.internal,
        imported: note.imported,
        importedFrom: note.imported_from,
      };

      // persist author and note
      const noteAuthorEntry = (await Account.ensureGitLabAccount(note.author))[0];

      const noteEntry = (await Note.ensureByExample({ id: note.id }, newNote))[0];

      // connect author and note
      await NoteAccountConnection.ensure({}, { from: noteEntry, to: noteAuthorEntry });
      noteEntries.push(noteEntry);
    }

    return noteEntries;
  };

  // this currently clashes with the notes colleciton and yields redundant data
  persistComment(note, belongsToReviewThread, parentEntry) {
    let commentEntry;
    return Comment.findOneByExample({ id: String(note.id) })
      .then((existingComment) => {
        if (!note.system && (!existingComment || new Date(existingComment.data.updatedAt).getTime() < new Date(note.updatedAt).getTime())) {
          log('Processing note #' + note.id);
          return Comment.persist({
            id: note.id,
            author: note.author,
            createdAt: note.createdAt,
            bodyText: note.body,
            updatedAt: note.updatedAt,
            path: note.position?.filePath,
            lastEditedAt: note.lastEditedAt,
          }).then(([persistedComment]) => {
            log('Persisted comment #' + persistedComment.data.id);
            commentEntry = persistedComment;
          });
        } else {
          log('Skipping comment #' + note.id);
          commentEntry = existingComment;
        }
      })
      .then(() => {
        // do not process system notes
        if (note.system) return;

        if (belongsToReviewThread) {
          this.connectCommentsToDiscussions(ReviewThreadCommentConnection, parentEntry, commentEntry);
        } else {
          this.connectCommentsToMergeRequests(MergeRequestCommentConnection, parentEntry, commentEntry);
        }
      });
  }

  async persistReviewThread(discussion, existingReviewThread) {
    let rtEntry;
    if (
      !existingReviewThread ||
      existingReviewThread.isResolved !== discussion.isResolved ||
      existingReviewThread.resolvedBy !== discussion.resolvedBy ||
      existingReviewThread.path !== discussion.notes.nodes[0].position.filePath
    ) {
      await ReviewThread.persist({
        id: discussion.id,
        path: discussion.notes.nodes[0].position.filePath,
        isResolved: discussion.resolved,
      }).then(async ([persistedDiscussion]) => {
        log('Persisted discussion #' + persistedDiscussion.data.id);
        rtEntry = persistedDiscussion;
        if (discussion.isResolved) {
          const resolvedByEntry = (await Account.ensureGitLabAccount(discussion.resolvedBy))[0];
          await this.connectReviewThreadsToUsers(ReviewThreadAccountConnection, rtEntry, resolvedByEntry);
        }
      });
    } else {
      log('Skipping discussion #' + discussion.id);
      rtEntry = existingReviewThread;
    }
    return rtEntry;
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

  connectIssuesToNotes = async (conn, issue, notes) => {
    await Promise.all(notes.map((note) => conn.ensure({}, { from: issue, to: note })));
  };

  connectIssuesToMilestones = async (conn, issue, milestone) => {
    if (issue === null || issue === undefined || milestone === null || milestone === undefined) {
      return;
    }
    await conn.ensure({}, { from: issue, to: milestone });
  };

  connectDiscussionsToMergeRequests = async (conn, mergeRequest, discussion) => {
    await conn.ensure({}, { from: mergeRequest, to: discussion });
  };

  connectCommentsToMergeRequests = async (conn, mergeRequest, comment) => {
    log(comment);
    await conn.ensure({}, { from: mergeRequest, to: comment });
  };

  connectCommentsToDiscussions = async (conn, discussion, comment) => {
    await conn.ensure({}, { from: discussion, to: comment });
  };

  connectReviewThreadsToUsers = async (conn, reviewThread, account) => {
    await conn.ensureWithData({ role: 'resolvedBy' }, { from: reviewThread, to: account });
  };
}

export default GitLabITSIndexer;
