'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import moment from 'moment/moment';
import _ from 'lodash';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

//add stakeholder to commit
async function preprocessCommit(commit, database, commitStakeholderRelations) {
  const relevantRelation = commitStakeholderRelations.filter((r) => r.to === commit._id)[0];
  if (!relevantRelation) {
    console.log('Error in localDB: commit: no stakeholder found for commit ' + commit.sha);
    return commit;
  }

  const author = (await findID(database, relevantRelation.from)).docs[0];
  if (!author) {
    console.log('Error in localDB: commit: no stakeholder found with ID ' + relevantRelation.from);
    return commit;
  }

  return _.assign(commit, { signature: author.gitSignature });
}

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

async function findAllCommits(database, relations) {
  let commits = await database.find({
    selector: { _id: { $regex: new RegExp('^commits/.*') } },
  });
  const relevantRelations = (await findCommitStakeholderConnections(relations)).docs;
  commits.docs = await Promise.all(commits.docs.map((c) => preprocessCommit(c, database, relevantRelations)));
  return commits;
}

function findIssue(database, iid) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^issues/.*') }, iid: { $eq: iid } },
  });
}

async function findCommit(database, relations, sha) {
  let commit = await database.find({
    selector: { _id: { $regex: new RegExp('^commits/.*') }, sha: { $eq: sha } },
  });
  if (commit.docs && commit.docs[0]) {
    const commitStakeholderConnections = (await findCommitStakeholderConnections(relations)).docs;
    commit.docs[0] = await preprocessCommit(commit.docs[0], database, commitStakeholderConnections);
  }
  return commit;
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

function findID(database, id) {
  return database.find({
    selector: { _id: id },
  });
}

function findFileConnections(relations, sha) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-files/.*') }, to: { $eq: 'commits/' + sha } },
  });
}

function findCommitFileConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-files/.*') } },
  });
}

function findSpecificFileConnections(relations, commitID, fileId) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-files/.*') }, to: { $eq: commitID }, from: { $eq: fileId } },
  });
}

function findCommitStakeholderConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^commits-stakeholders/.*') } },
  });
}

function findIssueCommitConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^issues-commits/.*') } },
  });
}

export default class Issues {
  static getIssueData(db, relations, issueSpan, significantSpan) {
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

  static getCommitsForIssue(db, relations, issueId) {
    let iid;
    if (typeof issueId === 'string') {
      iid = parseInt(issueId);
    } else {
      iid = issueId;
    }

    return findIssue(db, iid).then(async (resIssue) => {
      const issue = resIssue.docs[0];
      const allCommits = (await findAllCommits(db, relations)).docs;
      const result = [];
      const issueCommitConnections = (await findIssueCommitConnections(relations)).docs.filter((r) => r.to === issue._id);
      for (const conn of issueCommitConnections) {
        const commitObject = allCommits.filter((c) => c._id === conn.from)[0];
        if (commitObject) {
          result.push(commitObject);
        }
      }
      return result;
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

  static getRelatedCommitDataOwnershipRiver(db, relations, issue) {
    if (issue !== null) {
      return findIssue(db, issue.iid).then(async (resIssue) => {
        const foundIssue = resIssue.docs[0];
        const allCommits = (await findAllCommits(db, relations)).docs;
        foundIssue.commits = { count: 0, data: [] };
        const issueCommitConnections = (await findIssueCommitConnections(relations)).docs.filter((r) => r.to === foundIssue._id);
        for (const conn of issueCommitConnections) {
          const commitObject = allCommits.filter((c) => c._id === conn.from)[0];
          if (commitObject) {
            foundIssue.commits.count++;
            foundIssue.commits.data.push(commitObject);
          }
        }
        return foundIssue;
      });
    } else {
      return {};
    }
  }

  static issueImpactQuery(db, relations, iid, since, until) {
    return findIssue(db, iid).then(async (resIssue) => {
      const issue = resIssue.docs[0];
      const allCommits = (await findAllCommits(db, relations)).docs;
      issue.commits = { data: [] };

      const issueCommitConnections = (await findIssueCommitConnections(relations)).docs.filter((r) => r.to === issue._id);
      for (const conn of issueCommitConnections) {
        const commit = allCommits.filter((c) => c._id === conn.from)[0];
        if (commit &&
            new Date(commit.date) >= new Date(since) &&
            new Date(commit.date) <= new Date(until)) {
          const builds = (await findBuild(db, commit.sha)).docs;
          commit.files = { data: [] };
          const fileConnections = (await findFileConnections(relations, commit.sha)).docs;
          if (builds.length > 0) {
            commit.build = builds[0];
          }

          for (const fileRelation of fileConnections) {
            fileRelation.file = (await findID(db, fileRelation.from)).docs[0];
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
      const allCommits = (await findAllCommits(db, relations)).docs;
      const allCommitFileConnections = (await findCommitFileConnections(relations)).docs;
      const allIssueCommitConnections = (await findIssueCommitConnections(relations)).docs

      let fileObj = null;
      const resFile = await findFile(db, file);
      if (resFile.docs.length > 0) {
        fileObj = resFile.docs[0];
      }

      for (const issue of res.docs) {
        issue.commits = { data: [] };


        const issueCommitConnections = allIssueCommitConnections.filter((r) => r.to === issue._id);
        for (const conn of issueCommitConnections) {
          const commit = allCommits.filter((c) => c._id === conn.from)[0];
          if (commit) {
            if (fileObj) {
              const commitFileConnection = allCommitFileConnections.filter((cf) => cf.to === commit._id && cf.from === fileObj._id);
              if (commitFileConnection.length > 0) {
                commit.file = {
                  file: { path: fileObj.path },
                  lineCount: commitFileConnection[0].lineCount,
                  hunks: commitFileConnection[0].hunks,
                };
              } else {
                commit.file = {
                  file: { path: fileObj.path },
                  lineCount: 0,
                  hunks: [],
                };
              }
              issue.commits.data.push(commit);
            }
          }
        }
        issues.push(issue);
      }

      return { issues: { data: issues } };
    });
  }
}
