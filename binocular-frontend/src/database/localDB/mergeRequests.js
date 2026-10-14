'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { findAllMergeRequests, findMergeRequestCommitConnections, findIssue, findAllCommits, binarySearch } from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class MergeRequests {
  static getMergeRequestData(db, relations, mergeRequestsSpan, significantSpan) {
    // return all issues, filtering according to parameters can be added in the future
    return findAllMergeRequests(db, relations).then((res) => {
      res.docs = res.docs
        .sort((a, b) => {
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        .filter((i) => new Date(i.createdAt) >= new Date(significantSpan[0]) && new Date(i.createdAt) <= new Date(significantSpan[1]));
      return res.docs;
    });
  }

  static getCommitsForMergeRequest(db, relations, mergeRequestId) {
    let iid;
    if (typeof mergeRequestId === 'string') {
      iid = parseInt(mergeRequestId);
    } else {
      iid = mergeRequestId;
    }

    return findIssue(db, iid).then(async (resIssue) => {
      const mergeRequest = resIssue.docs[0];
      const allCommits = (await findAllCommits(db, relations)).docs;
      const result = [];
      const mergeRequestCommitConnections = (await findMergeRequestCommitConnections(relations)).docs.filter(
        (r) => r.from === mergeRequest._id,
      );
      for (const conn of mergeRequestCommitConnections) {
        const commitObject = binarySearch(allCommits, conn.to, '_id');
        if (commitObject !== null) {
          result.push(commitObject);
        }
      }
      return result;
    });
  }
}
