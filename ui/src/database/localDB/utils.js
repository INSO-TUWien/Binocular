"use strict";

import PouchDB from "pouchdb-browser";
import PouchDBFind from "pouchdb-find";
import PouchDBAdapterMemory from "pouchdb-adapter-memory";
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// ###################### GENERAL SEARCH FUNCTIONS ######################

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
export function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

export function findID(database, id) {
  return database.find({
    selector: { _id: id },
  });
}

export function bulkGet(database, ids) {
  const idsObjects = ids.map((id) => {
    return { id: id };
  });
  return database.bulkGet({
    docs: idsObjects,
  });
}

// ###################### SPECIFIC SEARCHES ######################

export async function findAllCommits(database, relations) {
  let commits = await database.find({
    selector: { _id: { $regex: new RegExp("^commits/.*") } },
  });
  const relevantRelations = (await findCommitStakeholderConnections(relations))
    .docs;
  commits.docs = await Promise.all(
    commits.docs.map((c) => preprocessCommit(c, database, relevantRelations))
  );
  return commits;
}

export async function findCommit(database, relations, sha) {
  let commit = await database.find({
    selector: { _id: { $regex: new RegExp("^commits/.*") }, sha: { $eq: sha } },
  });
  if (commit.docs && commit.docs[0]) {
    const commitStakeholderConnections = (
      await findCommitStakeholderConnections(relations)
    ).docs;
    commit.docs[0] = await preprocessCommit(
      commit.docs[0],
      database,
      commitStakeholderConnections
    );
  }
  return commit;
}

//add stakeholder to commit
export async function preprocessCommit(
  commit,
  database,
  commitStakeholderRelations
) {
  const relevantRelation = commitStakeholderRelations.filter(
    (r) => r.to === commit._id
  )[0];
  if (!relevantRelation) {
    console.log(
      "Error in localDB: commit: no stakeholder found for commit " + commit.sha
    );
    return commit;
  }

  const author = (await findID(database, relevantRelation.from)).docs[0];
  if (!author) {
    console.log(
      "Error in localDB: commit: no stakeholder found with ID " +
        relevantRelation.from
    );
    return commit;
  }

  return _.assign(commit, { signature: author.gitSignature });
}

export function findIssue(database, iid) {
  return database.find({
    selector: { _id: { $regex: new RegExp("^issues/.*") }, iid: { $eq: iid } },
  });
}

export function findFile(database, file) {
  return database.find({
    selector: { _id: { $regex: new RegExp("^files/.*") }, path: { $eq: file } },
  });
}

// ###################### CONNECTIONS ######################

export function findFileCommitConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^commits-files/.*") } },
  });
}

export function findCommitStakeholderConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^commits-stakeholders/.*") } },
  });
}

export function findFileCommitStakeholderConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^commits-files-stakeholders/.*") } },
  });
}

export function findBranch(database, branch) {
  return database.find({
    selector: {
      _id: { $regex: new RegExp("^branches/.*") },
      branch: { $eq: branch },
    },
  });
}

export function findBranchFileConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^branches-files/.*") } },
  });
}

// a connection between a branch-file edge and a file
export function findBranchFileFileConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^branches-files-files/.*") } },
  });
}

export function findBuild(database, sha) {
  return database.find({
    selector: { _id: { $regex: new RegExp("^builds/.*") }, sha: { $eq: sha } },
  });
}

export function findFileConnections(relations, sha) {
  return relations.find({
    selector: {
      _id: { $regex: new RegExp("^commits-files/.*") },
      to: { $eq: "commits/" + sha },
    },
  });
}

export function findCommitFileConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^commits-files/.*") } },
  });
}

export function findIssueCommitConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^issues-commits/.*") } },
  });
}

export function findCommitBuildConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp("^commits-builds/.*") } },
  });
}

export function findSpecificFileConnections(relations, commitID, fileId) {
  return relations.find({
    selector: {
      _id: { $regex: new RegExp("^commits-files/.*") },
      to: { $eq: commitID },
      from: { $eq: fileId },
    },
  });
}
