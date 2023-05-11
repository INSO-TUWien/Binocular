'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(database, collection) {
  return database.find({
    selector: { _id: { $regex: new RegExp(`^${collection}/.*`) } },
  });
}

function findBranch(database, branch) {
  return database.find({
    selector: { _id: { $regex: new RegExp('^branches/.*') }, branch: { $eq: branch } },
  });
}

function findID(database, id) {
  return database.find({
    selector: { _id: id },
  });
}

function findBranchFileConnections(relations) {
  return relations.find({
    selector: { _id: { $regex: new RegExp('^branches-files/.*') } },
  });
}

export default class Files {
  static requestFileStructure(db) {
    return findAll(db, 'files').then((res) => {
      return { files: { data: res.docs } };
    });
  }

  static getFilenamesForBranch(db, relations, branchName) {
    return findBranch(db, branchName).then(async (resBranch) => {
      const branch = resBranch.docs[0];
      const files = (await findAll(db, 'files')).docs;
      const branchFileConnections = (await findBranchFileConnections(relations)).docs.filter((connection) => connection.to === branch._id);
      const filenames = [];
      for (const connection of branchFileConnections) {
        const resFiles = files.filter(f => f._id === connection.from);
        if (resFiles.length > 0) {
          const file = resFiles[0];
          filenames.push(file.path);
        }
      }
      return filenames.sort();
    });
  }
}
