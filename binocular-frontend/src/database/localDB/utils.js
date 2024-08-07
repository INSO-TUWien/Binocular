'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import _ from 'lodash';

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// ###################### GENERAL SEARCH FUNCTIONS ######################

// searches for elements `e` of the array `arr` where `e[attribute] === val`.
// returns an array of all elements of `arr` where the condition holds.
// `arr` must be sorted by `attribute` in ascending order.
export const binarySearchArray = (arr, val, attribute) => {
  let l = 0;
  let r = arr.length - 1;
  // Loop to implement Binary Search
  while (l <= r) {
    // calc mid
    const m = l + Math.floor((r - l) / 2);
    const res = val.localeCompare(arr[m][attribute]);

    // Check if val is present at mid
    if (res === 0) {
      //now get the first and last occurrence
      let from = m;
      let to = m;

      while (from > 0) {
        if (val.localeCompare(arr[from - 1][attribute]) !== 0) {
          break;
        }
        from--;
      }

      while (to < arr.length - 1) {
        if (val.localeCompare(arr[to + 1][attribute]) !== 0) {
          break;
        }
        to++;
      }

      return arr.slice(from, to + 1);
    }

    // If x greater, ignore left half
    if (res > 0) l = m + 1;
    // If x is smaller, ignore right half
    else {
      r = m - 1;
    }
  }

  return [];
};

// searches for element `e` of the array `arr` where `e[attribute] === val`.
// returns one element of `arr` where the condition holds.
// `arr` must be sorted by `attribute` in ascending order.
export const binarySearch = (arr, val, attribute) => {
  let l = 0;
  let r = arr.length - 1;
  // Loop to implement Binary Search
  while (l <= r) {
    // calc mid
    const m = l + Math.floor((r - l) / 2);
    const res = val.localeCompare(arr[m][attribute]);

    // Check if val is present at mid
    if (res === 0) {
      return arr[m];
    }

    // If x greater, ignore left half
    if (res > 0) l = m + 1;
    // If x is smaller, ignore right half
    else {
      r = m - 1;
    }
  }

  return null;
};

// sorts an array by the string value of `attribute` in asc/desc order (default: asc).
// example `sortByAttributeString([{a: 'def'},{a: 'abc'},{a: 'ghi'}], 'a', 'asc')`
//  returns `[{a: 'abc'},{a: 'def'},{a: 'ghi'}]`
export const sortByAttributeString = (arr, attribute, order = 'asc') => {
  if (order === 'asc') {
    return arr.sort((a, b) => a[attribute].localeCompare(b[attribute]));
  } else if (order === 'desc') {
    return arr.sort((a, b) => b[attribute].localeCompare(a[attribute]));
  } else {
    return arr;
  }
};

// find all documents of a given collection (example: 'issues' or 'commits-users')
export function findAll(database, collection) {
  //this fetches documents starting with _id startKey until _id endKey.
  // this works because the ids of our documents include the collection name.
  // Note that \ufff0 is a high unicode character, so all documents with an id starting with startKey are fetched
  //  (see https://pouchdb.com/api.html#batch_fetch).
  // MUCH faster database.find() (see https://pouchdb.com/guides/bulk-operations.html#please-use-alldocs)
  const startKey = collection + '/';
  const endKey = startKey + '\ufff0';
  return database
    .allDocs({
      startkey: startKey,
      endkey: endKey,
      include_docs: true,
    })
    .then((res) => {
      return {
        docs: res.rows.map((r) => r.doc),
      };
    });
}

// finds a specific document with the specified id
export function findID(database, id) {
  return database.find({
    selector: { _id: id },
  });
}

// ###################### SPECIFIC SEARCHES ######################

export async function findAllCommits(database, relations) {
  const commits = await findAll(database, 'commits');
  const allCommits = sortByAttributeString(commits.docs, '_id');
  const commitUserConnections = sortByAttributeString((await findCommitUserConnections(relations)).docs, 'from');
  const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'from');

  const userObjects = (await findAll(database, 'users')).docs;
  const users = {};
  userObjects.map((s) => {
    users[s._id] = s.gitSignature;
  });

  commits.docs = await Promise.all(
    commits.docs.map((c) => preprocessCommit(c, allCommits, commitUserConnections, commitCommitConnections, users)),
  );

  return commits;
}

export async function findCommit(database, relations, sha) {
  const allCommits = sortByAttributeString((await findAll(database, 'commits')).docs, '_id');
  const commit = await database.find({
    selector: { _id: { $regex: new RegExp('^commits/.*') }, sha: { $eq: sha } },
  });

  if (commit.docs && commit.docs[0]) {
    const commitUserConnections = sortByAttributeString((await findCommitUserConnections(relations)).docs, 'from');
    const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'from');

    const userObjects = (await findAll(database, 'users')).docs;
    const users = {};
    userObjects.map((s) => {
      users[s._id] = s.gitSignature;
    });
    commit.docs[0] = await preprocessCommit(commit.docs[0], allCommits, commitUserConnections, commitCommitConnections, users);
  }
  return commit;
}

//add user, parents to commit
async function preprocessCommit(commit, allCommits, commitUser, commitCommit, users) {
  //add parents: first get the ids of the parents using the commits-commits connection, then find the actual commits to get the hashes
  commit.parents = binarySearchArray(commitCommit, commit._id, 'from').map((r) => {
    const parent = binarySearch(allCommits, r.to, '_id');
    if (parent !== null) {
      return parent.sha;
    }
  });

  //add user
  const commitUserRelation = binarySearch(commitUser, commit._id, 'from');

  if (!commitUserRelation) {
    console.log('Error in localDB: commit: no user found for commit ' + commit.sha);
    return commit;
  }
  const author = users[commitUserRelation.to];

  if (!author) {
    console.log('Error in localDB: commit: no user found with ID ' + commitUserRelation.to);
    return commit;
  }
  return _.assign(commit, { signature: author });
}

export function findIssue(database, iid) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^issues/.*') }, iid: { $eq: iid } },
  });
}

export function findFile(database, file) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^files/.*') }, path: { $eq: file } },
  });
}

export async function findAllIssues(database, relations) {
  return findAllIssuesOrMergeRequests(database, relations, 'issues');
}

export async function findAllMergeRequests(database, relations) {
  return findAllIssuesOrMergeRequests(database, relations, 'mergeRequests');
}

// finds all Issues/MRs and infers notes, author, assignee and assignees using the respective relations
async function findAllIssuesOrMergeRequests(database, relations, type) {
  if (type !== 'issues' && type !== 'mergeRequests') {
    return [];
  }
  const issues = await findAll(database, type);

  // get issues-accounts connections and sort by the issues ids
  const issuesAccounts = sortByAttributeString((await findAll(relations, `${type}-accounts`)).docs, 'from');
  const accounts = sortByAttributeString((await findAll(database, 'accounts')).docs, '_id');

  // get relevant connections for notes
  // notes array should already be sorted by _id
  const notes = (await findAll(database, 'notes')).docs;
  const issuesNotesConnections = sortByAttributeString((await findIssueNoteConnections(relations)).docs, 'from');
  const notesAccountsConnections = sortByAttributeString((await findNoteAccountConnections(relations)).docs, 'from');

  issues.docs = issues.docs.map((i) => {
    // related notes
    i.notes = [];
    const relevantNotesConnections = binarySearchArray(issuesNotesConnections, i._id, 'from');
    i.notes = relevantNotesConnections.map((issueNote) => {
      // find note this connection points to
      const note = binarySearch(notes, issueNote.to, '_id');
      // find author of this note
      // find the outgoing connection from this note to the acc of the author
      const noteAccConnection = binarySearch(notesAccountsConnections, note._id, 'from');
      // find the actual acc the connection points to
      note.author = binarySearch(accounts, noteAccConnection.to, '_id');
      return note;
    });

    // related accounts
    i.author = {};
    i.assignee = {};
    i.assignees = [];
    // find all related accounts
    const relevantAccConnections = binarySearchArray(issuesAccounts, i._id, 'from');
    relevantAccConnections.forEach((c) => {
      // find account
      const a = binarySearch(accounts, c.to, '_id');
      // add account to the issue i the role defined by the connection
      if (c.role === 'author') {
        i.author = a;
      } else if (c.role === 'assignee') {
        i.assignee = a;
      } else if (c.role === 'assignees') {
        i.assignees.push(a);
      }
    });
    return i;
  });
  return issues;
}

// ###################### CONNECTIONS ######################

export function findFileCommitConnections(relations) {
  return findAll(relations, 'commits-files');
}

export function findCommitUserConnections(relations) {
  return findAll(relations, 'commits-users');
}

export function findCommitCommitConnections(relations) {
  return findAll(relations, 'commits-commits');
}

export function findFileCommitUserConnections(relations) {
  return findAll(relations, 'commits-files-users');
}

export function findBranch(database, branch) {
  return database.find({
    selector: {
      _id: { $regex: new RegExp('^branches/.*') },
      branch: { $eq: branch },
    },
  });
}

export function findBranchFileConnections(relations) {
  return findAll(relations, 'branches-files');
}

// a connection between a branch-file edge and a file
export function findBranchFileFileConnections(relations) {
  return findAll(relations, 'branches-files-files');
}

export function findBuild(database, sha) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^builds/.*') }, sha: { $eq: sha } },
  });
}

// TODO should probably not be used, very slow
export function findFileConnections(relations, commitId) {
  return relations.find({
    selector: {
      _id: { $regex: new RegExp('^commits-files/.*') },
      from: { $eq: commitId },
    },
  });
}

export function findIssueCommitConnections(relations) {
  return findAll(relations, 'issues-commits');
}

export function findCommitBuildConnections(relations) {
  return findAll(relations, 'commits-builds');
}

export function findIssueNoteConnections(relations) {
  return findAll(relations, 'issues-notes');
}

export function findNoteAccountConnections(relations) {
  return findAll(relations, 'notes-accounts');
}
