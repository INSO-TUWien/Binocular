'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import {
  binarySearch,
  binarySearchArray,
  findAll,
  findBranch,
  findBranchFileConnections,
  findBranchFileFileConnections,
  findFileCommitConnections,
  findFileCommitUserConnections,
  sortByAttributeString,
} from './utils';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

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
      const branchFileConnections = (await findBranchFileConnections(relations)).docs.filter(
        (connection) => connection.from === branch._id,
      );
      const filenames = [];
      for (const connection of branchFileConnections) {
        const file = binarySearch(files, connection.to, '_id');
        if (file !== null) {
          filenames.push(file.path);
        }
      }
      return filenames.sort();
    });
  }

  // Note: very slow implementation. If this function is needed, rewrite it similarly to ./commits.js `getOwnershipDataForCommits`
  static getFilesForCommits(db, relations, hashes) {
    return findAll(db, 'commits').then(async (res) => {
      let commits = res.docs;

      commits = commits.filter((c) => hashes.includes(c.sha));
      const allFiles = (await findAll(db, 'files')).docs;
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;

      const result = [];

      for (const commit of commits) {
        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.to === commit._id);
        for (const connection of relevantConnections) {
          if (result.filter((f) => f._id === connection.from).length !== 0) {
            continue;
          }
          result.push(allFiles.filter((f) => f._id === connection.from)[0]);
        }
      }

      return result.map((f) => {
        return { file: { path: f.path } };
      });
    });
  }

  static getPreviousFilenamesForFilesOnBranch(db, relations, branchName) {
    return findBranch(db, branchName).then(async (resBranch) => {
      const result = [];
      const branch = resBranch.docs[0];
      //find all branch-file-file connections. These are connections between a branch-file edge and a file.
      // They tell us which files on a branch had another name in the past (since renaming a file effectively creates a new file)
      const branchFileFileConnections = sortByAttributeString((await findBranchFileFileConnections(relations)).docs, 'from');
      //find all files and extract the ones that are on this branch
      const files = (await findAll(db, 'files')).docs;
      // find connections from this branch to files
      const branchFileConnections = (await findBranchFileConnections(relations)).docs.filter(
        (connection) => connection.from === branch._id,
      );

      // for each connection, extract the file object and find all connections to other files (previous names)
      for (const branchFileConnection of branchFileConnections) {
        const currentFile = binarySearch(files, branchFileConnection.to, '_id');
        if (currentFile !== null) {
          //get connections to other files
          const connectionsToOtherFiles = binarySearchArray(branchFileFileConnections, branchFileConnection._id, 'from');

          //if there are no connections, go to the next bf connection
          if (connectionsToOtherFiles.length === 0) {
            continue;
          }
          //this object says the file with this path has had these previous filenames
          const resultObject = {
            path: currentFile.path,
            previousFileNames: [],
          };

          for (const branchFileFileConnection of connectionsToOtherFiles) {
            // get referenced file
            const referencedFile = binarySearch(files, branchFileFileConnection.to, '_id');
            if (referencedFile !== null) {
              resultObject.previousFileNames.push({
                oldFilePath: referencedFile.path,
                hasThisNameFrom: branchFileFileConnection.hasThisNameFrom,
                hasThisNameUntil: branchFileFileConnection.hasThisNameUntil,
              });
            }
          }
          result.push(resultObject);
        }
      }
      return result;
    });
  }

  // Note: very slow implementation. If this function is needed, rewrite it similarly to ./commits.js `getOwnershipDataForCommits`
  static getOwnershipDataForFiles(db, relations, files) {
    return findAll(db, 'files').then(async (resFiles) => {
      let fileObjects = resFiles.docs;
      fileObjects = fileObjects.filter((fo) => files.includes(fo.path));

      const result = [];

      const commits = (await findAll(db, 'commits')).docs;
      const users = (await findAll(db, 'users')).docs;
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const fileCommitUserConnections = (await findFileCommitUserConnections(relations)).docs;

      //get all commits-files connection of this file
      for (const file of fileObjects) {
        const fileResult = { path: file.path, ownership: [] };
        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.from === file._id);

        //for each of these relevant connections, we want to extract the commit data and ownership connections (commits-files-users)
        for (const conn of relevantConnections) {
          const relevantCommit = commits.filter((c) => c._id === conn.to)[0];
          const commitResult = { commit: { sha: relevantCommit.sha, date: relevantCommit.date }, ownership: [] };

          const relevantOwnershipConnections = fileCommitUserConnections.filter((fcsc) => fcsc.from === conn._id);

          //for each of the ownership connections, add the signature of the user and the owned lines to commitResult.ownership
          for (const ownershipConn of relevantOwnershipConnections) {
            const user = users.filter((s) => s._id === ownershipConn.to)[0].gitSignature;
            commitResult.ownership.push({ user: user, hunks: ownershipConn.hunks });
          }
          //add to the result object of the current file
          fileResult.ownership.push(commitResult);
        }

        //add to the overall result array
        result.push(fileResult);
      }
      return result;
    });
  }
}
