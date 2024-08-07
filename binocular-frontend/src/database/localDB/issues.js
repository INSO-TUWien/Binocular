'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import {
  findAll,
  findAllCommits,
  findIssue,
  findBuild,
  findFile,
  findID,
  findFileConnections,
  findIssueCommitConnections,
  findFileCommitConnections,
  binarySearch,
  findAllIssues,
} from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Issues {
  static getIssueData(db, relations, issueSpan, significantSpan) {
    // return all issues, filtering according to parameters can be added in the future
    return findAllIssues(db, relations).then((res) => {
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
      const issueCommitConnections = (await findIssueCommitConnections(relations)).docs.filter((r) => r.from === issue._id);
      for (const conn of issueCommitConnections) {
        const commitObject = binarySearch(allCommits, conn.to, '_id');
        if (commitObject !== null) {
          result.push(commitObject);
        }
      }
      return result;
    });
  }

  // Note: very slow implementation. Rewrite similarly to functions in commits.js (use binary search)
  static issueImpactQuery(db, relations, iid, since, until) {
    return findIssue(db, iid).then(async (resIssue) => {
      const issue = resIssue.docs[0];
      const allCommits = (await findAllCommits(db, relations)).docs;
      issue.commits = { data: [] };

      const issueCommitConnections = (await findIssueCommitConnections(relations)).docs.filter((r) => r.to === issue._id);
      for (const conn of issueCommitConnections) {
        const commit = allCommits.filter((c) => c._id === conn.from)[0];
        if (commit && new Date(commit.date) >= new Date(since) && new Date(commit.date) <= new Date(until)) {
          const builds = (await findBuild(db, commit.sha)).docs;
          commit.files = { data: [] };
          const fileConnections = (await findFileConnections(relations, commit._id)).docs;
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

  static searchIssues(db, relations, text) {
    // return all issues, filtering according to parameters can be added in the future
    return findAllIssues(db, relations).then((res) => {
      res.docs = res.docs
        .filter((i) => i.title.includes(text) || `${i.iid}`.startsWith(text))
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
      const allCommitFileConnections = (await findFileCommitConnections(relations)).docs;
      const allIssueCommitConnections = (await findIssueCommitConnections(relations)).docs;

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
