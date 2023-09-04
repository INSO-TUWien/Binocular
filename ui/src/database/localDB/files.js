'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import { findAll, findBranch, findBranchFileConnections, findBranchFileFileConnections, findFileCommitConnections, findFileCommitStakeholderConnections } from './utils';
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
      const branchFileConnections = (await findBranchFileConnections(relations)).docs.filter((connection) => connection.to === branch._id);
      const filenames = [];
      for (const connection of branchFileConnections) {
        const resFiles = files.filter((f) => f._id === connection.from);
        if (resFiles.length > 0) {
          const file = resFiles[0];
          filenames.push(file.path);
        }
      }
      return filenames.sort();
    });
  }

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
      const branchFileFileConnections = (await findBranchFileFileConnections(relations)).docs;
      //find all files and extract the ones that are on this branch
      const files = (await findAll(db, 'files')).docs;
      // find connections from this branch to files
      const branchFileConnections = (await findBranchFileConnections(relations)).docs.filter((connection) => connection.to === branch._id);

      // for each connection, extract the file object and find all connections to other files (previous names)
      for (const branchFileConnection of branchFileConnections) {
        const resFiles = files.filter((f) => f._id === branchFileConnection.from);
        if (resFiles.length > 0) {
          const currentFile = resFiles[0];
          //get connections to other files
          const connectionsToOtherFiles = branchFileFileConnections.filter((bffCon) => {
            return bffCon.from === branchFileConnection._id;
          });

          //if there are no connections, go to the next bf connection
          if (connectionsToOtherFiles.length === 0) {
            continue;
          }
          //this object says the the file with this path has had these previous filenames
          const resultObject = {
            path: currentFile.path,
            previousFileNames: [],
          };

          for (const branchFileFileConnection of connectionsToOtherFiles) {
            // get referenced file
            const resFiles = files.filter((f) => f._id === branchFileFileConnection.to);
            if (resFiles.length > 0) {
              const referencedFile = resFiles[0];
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

  static getOwnershipDataForFiles(db, relations, files) {
    return findAll(db, 'files').then(async (resFiles) => {
      let fileObjects = resFiles.docs;
      fileObjects = fileObjects.filter((fo) => files.includes(fo.path));

      let result = [];

      const commits = (await findAll(db, 'commits')).docs;
      const stakeholders = (await findAll(db, 'stakeholders')).docs;
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const fileCommitStakeholderConnections = (await findFileCommitStakeholderConnections(relations)).docs;

      //get all commits-files connection of this file
      for (const file of fileObjects) {
        let fileResult = { path: file.path, ownership: [] };
        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.from === file._id);

        //for each of these relevant connections, we want to extract the commit data and ownership connections (commits-files-stakeholders)
        for (const conn of relevantConnections) {
          const relevantCommit = commits.filter((c) => c._id === conn.to)[0];
          let commitResult = { commit: { sha: relevantCommit.sha, date: relevantCommit.date }, ownership: [] };

          let relevantOwnershipConnections = fileCommitStakeholderConnections.filter((fcsc) => fcsc.from === conn._id);

          //for each of the ownership connections, add the signature of the stakeholder and the owned lines to commitResult.ownership
          for (const ownershipConn of relevantOwnershipConnections) {
            const stakeholder = stakeholders.filter((s) => s._id === ownershipConn.to)[0].gitSignature;
            commitResult.ownership.push({ stakeholder: stakeholder, ownedLines: ownershipConn.ownedLines });
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
