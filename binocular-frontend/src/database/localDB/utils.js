'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { addHistoryToAllCommits } from '../utils';
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

// find all documents of a given collection (example: 'issues' or 'commits-stakeholders')
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
  const commitStakeholderConnections = sortByAttributeString((await findCommitStakeholderConnections(relations)).docs, 'to');
  const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'to');

  const stakeholderObjects = (await findAll(database, 'stakeholders')).docs;
  const stakeholders = {};
  stakeholderObjects.map((s) => {
    stakeholders[s._id] = s.gitSignature;
  });

  commits.docs = await Promise.all(
    commits.docs.map((c) => preprocessCommit(c, database, commitStakeholderConnections, commitCommitConnections, stakeholders)),
  );

  addHistoryToAllCommits(commits.docs);

  return commits;
}

export async function findCommit(database, relations, sha) {
  const commit = await database.find({
    selector: { _id: { $regex: new RegExp('^commits/.*') }, sha: { $eq: sha } },
  });

  if (commit.docs && commit.docs[0]) {
    const commitStakeholderConnections = sortByAttributeString((await findCommitStakeholderConnections(relations)).docs, 'to');
    const commitCommitConnections = sortByAttributeString((await findCommitCommitConnections(relations)).docs, 'to');

    const stakeholderObjects = (await findAll(database, 'stakeholders')).docs;
    const stakeholders = {};
    stakeholderObjects.map((s) => {
      stakeholders[s._id] = s.gitSignature;
    });
    commit.docs[0] = await preprocessCommit(commit.docs[0], database, commitStakeholderConnections, commitCommitConnections, stakeholders);
  }
  return commit;
}

//add stakeholder, parents to commit
async function preprocessCommit(commit, database, commitStakeholder, commitCommit, stakeholders) {
  //add parents
  commit.parents = binarySearchArray(commitCommit, commit._id, 'to').map((r) => r.from.split('/')[1]);

  //add stakeholder
  const commitStakeholderRelation = binarySearch(commitStakeholder, commit._id, 'to');

  if (!commitStakeholderRelation) {
    console.log('Error in localDB: commit: no stakeholder found for commit ' + commit.sha);
    return commit;
  }
  const author = stakeholders[commitStakeholderRelation.from];

  if (!author) {
    console.log('Error in localDB: commit: no stakeholder found with ID ' + commitStakeholderRelation.from);
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

// ###################### CONNECTIONS ######################

export function findFileCommitConnections(relations) {
  return findAll(relations, 'commits-files');
}

export function findCommitStakeholderConnections(relations) {
  return findAll(relations, 'commits-stakeholders');
}

export function findCommitCommitConnections(relations) {
  return findAll(relations, 'commits-commits');
}

export function findFileCommitStakeholderConnections(relations) {
  return findAll(relations, 'commits-files-stakeholders');
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
export function findFileConnections(relations, sha) {
  return relations.find({
    selector: {
      _id: { $regex: new RegExp('^commits-files/.*') },
      to: { $eq: 'commits/' + sha },
    },
  });
}

export function findIssueCommitConnections(relations) {
  return findAll(relations, 'issues-commits');
}

export function findCommitBuildConnections(relations) {
  return findAll(relations, 'commits-builds');
}
