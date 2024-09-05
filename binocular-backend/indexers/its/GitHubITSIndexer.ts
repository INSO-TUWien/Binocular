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
import Label from '../../types/supportingTypes/Label.ts';
import ReviewThread, { ReviewThreadDataType } from '../../models/models/ReviewThread.ts';
import _ from 'lodash';
import Comment, { ReviewCommentDataType } from '../../models/models/Comment.ts';
import MergeRequestCommentConnection, {
  MergeRequestCommentConnectionDataType,
} from '../../models/connections/MergeRequestCommentConnection.ts';
import ReviewThreadCommentConnection, {
  ReviewThreadCommentConnectionDataType,
} from '../../models/connections/ReviewThreadCommentConnection.ts';
import MergeRequestReviewThreadConnection, {
  MergeRequestReviewThreadConnectionDataType,
} from '../../models/connections/MergeRequestReviewThreadConnection.ts';
import CommentAccountConnection, { CommentAccountConnectionDataType } from '../../models/connections/CommentAccountConnection.ts';
import ReviewThreadAccountConnection, {
  ReviewThreadAccountConnectionDataType,
} from '../../models/connections/ReviewThreadAccountConnection.ts';

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
  const BATCH_SIZE = 100;

  // helper function that persists the issues/mergeRequests and associated GitHub user accounts (plus connections)
  const processIssues = async (issues: any, type: string, targetCollection: typeof Issue | typeof MergeRequest) => {
    let persistCount = 0;
    let omitCount = 0;

    // safe review thread ids for batch pulling
    const reviewThreadIds = new Map<string, Entry<MergeRequestDataType>>();

    // safe comment ids for batch pulling
    const commentIds = new Map<string, Entry<MergeRequestDataType | ReviewThreadDataType>>();

    for (const issue of issues) {
      log(`Processing ${type} #` + issue.number);

      let issueEntry: Entry<IssueDataType | MergeRequestDataType>;

      // create GitHub account objects for each relevant user (author, assignee, assignees)
      const authorEntry: Entry<AccountDataType> = (await Account.ensureGitHubAccount(this.controller.getUser(issue.author)))[0];
      const assigneeEntries: Entry<AccountDataType>[] = [];
      for (const a of issue.assignees.nodes) {
        assigneeEntries.push((await Account.ensureGitHubAccount(this.controller.getUser(a)))[0]);
      }

      const existingIssue = await targetCollection.findOneByExample({ id: String(issue.id) });

      if (!existingIssue || new Date(existingIssue.data.updatedAt).getTime() < new Date(issue.updatedAt).getTime()) {
        log(`Processing ${type} #` + issue.iid);

        // Note: contrary to GitLab, milestones are not supported yet by the GitHub indexer.
        const toBePersisted: any = {
          id: issue.id.toString(),
          iid: issue.number,
          title: issue.title,
          description: issue.body,
          state: issue.state,
          closedAt: issue.closedAt,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          labels: issue.labels.nodes.map((l: Label) => l.name),
          webUrl: issue.url,
        };

        // mentions attribute is only relevant for issues, not for merge requests
        if (targetCollection === Issue) {
          toBePersisted.mentions = issue.timelineItems.nodes.map((event: ItsIssueEvent) => {
            return {
              commit: event.commit ? event.commit.oid : null,
              createdAt: event.createdAt,
              closes: event.commit === undefined,
            } as Mention;
          });
        }

        const [persistedIssue, wasCreated] = await targetCollection.persist(toBePersisted);
        // save the entry object of the issue so we can connect it to the github users later
        issueEntry = persistedIssue;
        if (wasCreated) {
          persistCount++;
        }
        log(`Persisted ${type} #` + persistedIssue.data.iid);
      } else {
        // save the entry object of the issue so we can connect it to the github users later
        issueEntry = existingIssue;
        log(`Skipping ${type} #` + issue.iid);
        omitCount++;
      }

      // connect the issue/MR to the users (either as author, assignee or assignees)
      if (type === 'issue') {
        await connectIssuesToUsers(IssueAccountConnection, issueEntry, authorEntry, assigneeEntries);
        this.reporter.finishIssue();
      } else if (type === 'mergeRequest') {
        for (const reviewThread of issue.reviewThreads.nodes) {
          if (reviewThreadIds.size >= BATCH_SIZE) {
            await fetchReviewThreads(reviewThreadIds);
            reviewThreadIds.clear();
          }
          reviewThreadIds.set(reviewThread.id, issueEntry);
        }

        for (const comment of issue.commentNodes.nodes) {
          if (commentIds.size >= BATCH_SIZE) {
            await fetchComments(commentIds);
            commentIds.clear();
          }
          commentIds.set(comment.id, issueEntry);
        }

        await connectIssuesToUsers(MergeRequestAccountConnection, issueEntry, authorEntry, assigneeEntries);
        this.reporter.finishMergeRequest();
      }
    }

    // fetch the rest of the batch
    if (reviewThreadIds.size > 0) {
      await fetchReviewThreads(reviewThreadIds);
      reviewThreadIds.clear();
    }

    if (commentIds.size > 0) {
      await fetchComments(commentIds);
      commentIds.clear();
    }
    log(`Persisted %d new ${type}s (%d already present)`, persistCount, omitCount);
  };

  const fetchReviewThreads = async (reviewThreadIds: Map<string, Entry<MergeRequestDataType>>) => {
    const ids: string[] = [];
    reviewThreadIds.forEach((value, key) => {
      ids.push(key);
    });

    const reviewThreads = await this.controller.getReviewThreadsByIds(ids);
    processReviewThreads(reviewThreads, 'reviewThread', ReviewThread, reviewThreadIds);
  };

  const fetchComments = async (commentIds: Map<string, Entry<MergeRequestDataType | ReviewThreadDataType>>) => {
    const ids: string[] = [];
    commentIds.forEach((value, key) => {
      ids.push(key);
    });

    const comments = await this.controller.getCommentsByIds(ids);
    processComments(comments, Comment, commentIds);
  };

  // helper function that persists review threads for a merge request
  const processReviewThreads = async (
    reviewThreads: any,
    type: string,
    targetCollection: typeof ReviewThread,
    reviewThreadIds: Map<string, Entry<MergeRequestDataType>>,
  ) => {
    log(`Processing ${type} batch`);
    // contains ids of comments whose author is considered a reviewer of the PR
    // as reviewers field is not available in github graphql api
    // an author of a review thread is considered a reviewer instead
    // this leads to inconsistencies with the displayed reviewers field on the website but is a trade off
    const reviewRelevantComments = new Map<string, Entry<MergeRequestDataType>>();

    // safe comment ids for batch pulling
    const commentIds = new Map<string, Entry<MergeRequestDataType | ReviewThreadDataType>>();

    for (const reviewThread of reviewThreads) {
      // add the comment to the set to mark as reviewer
      let reviewThreadEntry: Entry<ReviewThreadDataType>;
      reviewRelevantComments.set(reviewThread.commentNodes.nodes[0].id, reviewThreadIds.get(reviewThread.id)!);

      const existingReviewThread = await targetCollection.findOneByExample({ id: String(reviewThread.id) });

      if (!existingReviewThread || !_.isEqual(existingReviewThread.data, reviewThread)) {
        const toBePersistedRT: any = {
          id: reviewThread.id,
          path: reviewThread.path,
          isResolved: reviewThread.isResolved,
        };
        return targetCollection.persist(toBePersistedRT).then(([persitedReviewThread]) => {
          reviewThreadEntry = persitedReviewThread;
        });
      } else {
        reviewThreadEntry = existingReviewThread;
      }

      reviewThread.commentNodes.nodes.forEach((comment) => {
        if (commentIds.size >= BATCH_SIZE) {
          fetchComments(commentIds);
          commentIds.clear();
        }
        commentIds.set(comment.id, reviewThreadEntry);
      });

      connectReviewThreadsToMergeRequests(MergeRequestReviewThreadConnection, reviewThreadIds.get(reviewThread.id)!, reviewThreadEntry);
      if (reviewThread.isResolved) {
        const resolvedByEntry: Entry<AccountDataType> = (
          await Account.ensureGitHubAccount(this.controller.getUser(reviewThread.resolvedBy))
        )[0];
        connectReviewThreadsToUsers(ReviewThreadAccountConnection, reviewThreadEntry, resolvedByEntry);
      }
    }

    // fetch the remaining batch
    if (commentIds.size > 0) {
      await fetchComments(commentIds);
      commentIds.clear();
    }
  };

  // helper function that persists a batch of comments
  const processComments = async (
    comments: any,
    targetCollection: typeof Comment,
    commentIds: Map<string, Entry<MergeRequestDataType | ReviewThreadDataType>>,
    reviewRelevantComments: Map<string, Entry<MergeRequestDataType>> = new Map<string, Entry<MergeRequestDataType>>(),
  ) => {
    for (const comment of comments) {
      let commentEntry: Entry<ReviewCommentDataType>;

      // persist the comment
      const existingComment = await targetCollection.findOneByExample({ id: String(comment.id) });
      if (!existingComment || !_.isEqual(existingComment, comment)) {
        const toBePersistedC: any = {
          id: comment.id,
          updatedAt: comment.updatedAt,
          createdAt: comment.createdAt,
          lastEditedAt: comment.lastEditedAt,
          path: comment.path,
          bodyText: comment.bodyText,
        };

        return targetCollection.persist(toBePersistedC).then(([persistedComment]) => {
          commentEntry = persistedComment;
        });
      } else {
        commentEntry = existingComment;
      }
      // connect the comment to its correcsponding parent
      if (comment.pullRequest.id) {
        commentIds.get(comment.id);
        connectCommentsToParents(MergeRequestCommentConnection, commentIds.get(comment.id)!, commentEntry);
      } else if (comment.pullRequestReview.id) {
        connectCommentsToParents(ReviewThreadCommentConnection, commentIds.get(comment.id)!, commentEntry);

        // connect the reviewer to the merge request
        for (const [key, value] of reviewRelevantComments) {
          if (key !== comment.id) return;
          const reviewer = await Account.ensureGitHubAccount(this.controller.getUser(comment.author))[0];
          connectReviewersToIssues(MergeRequestAccountConnection, value, reviewer);
          reviewRelevantComments.delete(key);
        }
      }

      // connect comment to author
      const authorEntry: Entry<AccountDataType> = (await Account.ensureGitHubAccount(this.controller.getUser(comment.author)))[0];
      connectCommentsToUsers(CommentAccountConnection, commentEntry, authorEntry);
    }
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

const connectReviewersToIssues = async (
  conn: Connection<MergeRequestAccountConnectionDataType, MergeRequestDataType, AccountDataType>,
  issue: Entry<MergeRequestDataType>,
  reviewers: Entry<AccountDataType>[],
) => {
  if (!reviewers) return;
  if (reviewers.length > 0) {
    await conn.ensureWithData({ role: 'reviewer' }, { from: issue, to: reviewers[0] });
  }
  await Promise.all(
    reviewers.map(async (reviewer) => {
      await conn.ensureWithData({ role: 'reviewers' }, { from: issue, to: reviewer });
    }),
  );
};

// connects comments to their respective parent entity (review thread or merge request)
const connectCommentsToParents = async (
  conn: Connection<
    MergeRequestCommentConnectionDataType | ReviewThreadCommentConnectionDataType,
    MergeRequestDataType | ReviewThreadDataType,
    ReviewCommentDataType
  >,
  parent: Entry<ReviewThreadDataType | MergeRequestDataType>,
  comment: Entry<ReviewCommentDataType>,
) => {
  await conn.ensureWithData({}, { from: parent, to: comment });
};

// connects review threads to their respective merge requests
const connectReviewThreadsToMergeRequests = async (
  conn: Connection<MergeRequestReviewThreadConnectionDataType, MergeRequestDataType, ReviewThreadDataType>,
  mergeRequest: Entry<MergeRequestDataType>,
  reviewThread: Entry<ReviewThreadDataType>,
) => {
  await conn.ensureWithData({}, { from: mergeRequest, to: reviewThread });
};

// connects comments to accounts
const connectCommentsToUsers = async (
  conn: Connection<CommentAccountConnectionDataType, ReviewCommentDataType, AccountDataType>,
  comment: Entry<ReviewCommentDataType>,
  account: Entry<AccountDataType>,
) => {
  await conn.ensureWithData({ role: 'author' }, { from: comment, to: account });
};

// connects review threads to accounts
const connectReviewThreadsToUsers = async (
  conn: Connection<ReviewThreadAccountConnectionDataType, ReviewThreadDataType, AccountDataType>,
  reviewThread: Entry<ReviewThreadDataType>,
  account: Entry<AccountDataType>,
) => {
  await conn.ensureWithData({ role: 'resolvedBy' }, { from: reviewThread, to: account });
};

GitHubITSIndexer.prototype.isStopping = function () {
  return this.stopping;
};

GitHubITSIndexer.prototype.stop = function () {
  log('Stopping');
  this.stopping = true;
};

export default GitHubITSIndexer;
