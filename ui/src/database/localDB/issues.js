'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import moment from 'moment/moment';
import _ from 'lodash';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

function findIssue(database, iid) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^issues/.*') }, iid: { $eq: iid } },
  });
}

function findCommit(database, sha) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^commits/.*') }, sha: { $eq: sha } },
  });
}

function findBuild(database, sha) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^builds/.*') }, sha: { $eq: sha } },
  });
}

function findFile(database, file) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^files/.*') }, path: { $eq: file } },
  });
}

function findFileConnections(relations, sha) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-files/.*') }, to: { $eq: 'commits/' + sha } },
  });
}

function findSpecificFileConnections(relations, commitID, fileId) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-files/.*') }, to: { $eq: commitID }, from: { $eq: fileId } },
  });
}

export default class Issues {
  static getIssueData(db, issueSpan, significantSpan) {
    // return all issues, filtering according to parameters can be added in the future
    return findAll(db, 'issues').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((i) => new Date(i.createdAt) >= new Date(significantSpan[0]) && new Date(i.createdAt) <= new Date(significantSpan[1]));
      return res.docs;
    });
  }

  static getIssueDataOwnershipRiver(db, issueSpan, significantSpan, granularity, interval) {
    // holds close dates of still open issues, kept sorted at all times
    const pendingCloses = [];

    // issues closed so far
    let closeCountTotal = 0,
      count = 0;

    let next = moment(significantSpan[0]).startOf('day').toDate().getTime();
    const data = [
      {
        date: new Date(issueSpan[0]),
        count: 0,
        openCount: 0,
        closedCount: 0,
      },
    ];
    return findAll(db, 'issues').then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((i) => new Date(i.createdAt) >= new Date(significantSpan[0]) && new Date(i.createdAt) <= new Date(significantSpan[1]))
        .map((issue) => {
          const createdAt = Date.parse(issue.createdAt);
          const closedAt = issue.closedAt ? Date.parse(issue.closedAt) : null;

          count++;

          // the number of closed issues at the issue's creation time, since
          // the last time we increased closedCountTotal
          const closedCount = _.sortedIndex(pendingCloses, createdAt);
          closeCountTotal += closedCount;

          // remove all issues that are closed by now from the "pending" list
          pendingCloses.splice(0, closedCount);

          while (createdAt >= next) {
            const dataPoint = {
              date: new Date(next),
              count,
              closedCount: closeCountTotal,
              openCount: count - closeCountTotal,
            };

            data.push(dataPoint);
            next += interval;
          }

          if (closedAt) {
            // issue has a close date, be sure to track it in the "pending" list
            const insertPos = _.sortedIndex(pendingCloses, closedAt);
            pendingCloses.splice(insertPos, 0, closedAt);
          } else {
            // the issue has not yet been closed, indicate that by pushing
            // null to the end of the pendingCloses list, which will always
            // stay there
            pendingCloses.push(null);
          }
        });
      return data;
    });
  }

  static issueImpactQuery(db, relations, iid, since, until) {
    return findIssue(db, iid).then(async (resIssue) => {
      const issue = resIssue.docs[0];
      issue.commits = { data: [] };
      for (const mentionedCommit of issue.mentions) {
        if (
          mentionedCommit.commit !== null &&
          new Date(mentionedCommit.createdAt) >= new Date(since) &&
          new Date(mentionedCommit.createdAt) <= new Date(until)
        ) {
          const commit = (await findCommit(db, mentionedCommit.commit)).docs[0];
          const builds = (await findBuild(db, commit.sha)).docs;
          commit.files = { data: [] };
          const fileConnections = (await findFileConnections(relations, commit.sha)).docs;
          if (builds.length > 0) {
            commit.build = builds[0];
          }

          for (const fileRelation of fileConnections) {
            fileRelation.file = (await findFile(db, fileRelation.from)).docs[0];
            fileRelation.file.id = fileRelation.file._id;
            commit.files.data.push(fileRelation);
          }

          issue.commits.data.push(commit);
        }
      }
      return { issue: issue };
    });
  }

  static searchIssues(db, text) {
    // return all issues, filtering according to parameters can be added in the future
    return findAll(db, 'issues').then((res) => {
      res.docs = res.docs
        .filter((i) => i.title.includes(text))
        .sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      return res.docs;
    });
  }

  static getCodeHotspotsIssueData(db, relations, file) {
    return findAll(db, 'issues').then(async (res) => {
      const issues = [];

      for (const issue of res.docs) {
        issue.commits = { data: [] };
        if (issue.mentions !== undefined) {
          for (const commitMention of issue.mentions) {
            if (commitMention.commit !== null) {
              const resCommit = await findCommit(db, commitMention.commit);
              if (resCommit.docs.length > 0) {
                const commit = resCommit.docs[0];
                const resFile = await findFile(db, file);
                if (resFile.docs.length > 0) {
                  const file = resFile.docs[0];
                  const commitFileConnection = await findSpecificFileConnections(relations, commit._id, file._id);
                  if (commitFileConnection.docs.length > 0) {
                    commit.file = {
                      file: { path: file.path },
                      lineCount: commitFileConnection.docs[0].lineCount,
                      hunks: commitFileConnection.docs[0].hunks,
                    };
                  } else {
                    commit.file = {
                      file: { path: file.path },
                      lineCount: 0,
                      hunks: [],
                    };
                  }
                  issue.commits.data.push(commit);
                }
              }
            }
          }
        }
        issues.push(issue);
      }
      return { issues: { data: issues } };
    });
  }
}
