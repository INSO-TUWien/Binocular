'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import {
  binarySearch,
  binarySearchArray,
  findAll,
  findAllCommits,
  findCommit,
  findFile,
  findFileCommitConnections,
  findFileCommitStakeholderConnections,
  sortByAttributeString,
} from './utils';

PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

export default class Commits {
  static getCommitData(db, relations, commitSpan, significantSpan) {
    // return all commits, filtering according to parameters can be added in the future
    const first = new Date(significantSpan[0]).getTime();
    const last = new Date(significantSpan[1]).getTime();

    return findAllCommits(db, relations).then((res) => {
      res.docs = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });

      return res.docs;
    });
  }

  static getCommitDataForSha(db, relations, sha) {
    //dont use findCommit here since we need to fetch all commits anyway in order to add history data
    return findAllCommits(db, relations).then((res) => {
      const result = res.docs.filter((c) => c.sha === sha)[0];
      return result;
    });
  }

  // Note: very slow implementation. If this function is needed, rewrite it similarly to ./commits.js `getOwnershipDataForCommits`
  static getCommitDataWithFiles(db, relations, commitSpan, significantSpan) {
    const first = new Date(significantSpan[0]).getTime();
    const last = new Date(significantSpan[1]).getTime();

    return findAllCommits(db, relations).then(async (res) => {
      const commits = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const allFiles = (await findAll(db, 'files')).docs;
      const result = [];

      for (const commit of commits) {
        commit.files = {};

        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.to === commit._id);

        //concurrently
        commit.files.data = relevantConnections.map((connection) => {
          const resultFile = allFiles.filter((file) => file._id === connection.from);
          if (resultFile.length > 0) {
            const file = resultFile[0];
            const res = { file: {} };
            res.file.path = file.path;
            res.stats = connection.stats;
            res.hunks = connection.hunks;
            return res;
          }
        });
        result.push(commit);
      }

      return result;
    });
  }

  static getCommitDataWithFilesAndOwnership(db, relations, commitSpan, significantSpan) {
    const first = new Date(significantSpan[0]).getTime();
    const last = new Date(significantSpan[1]).getTime();

    return findAllCommits(db, relations).then(async (res) => {
      // make sure we only consider commits in the specified timeframe
      const commits = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });

      // fetch and sort all collections and relations (sorting needed for binary search)
      const collections = await this.fetchAndSortOwnershipCollections(db, relations);
      const result = [];

      for (const commit of commits) {
        commit.files = {};
        const relevantConnections = binarySearchArray(collections.fileCommitConnections, commit._id, 'to');

        commit.files.data = relevantConnections.map((connection) => {
          const file = binarySearch(collections.files, connection.from, '_id');
          if (file !== null) {
            const res = { file: {} };
            res.file.path = file.path;
            res.stats = connection.stats;
            res.hunks = connection.hunks;
            res.ownership = [];

            //find connections to stakeholders for ownership data
            const relevantOwnershipConnections = binarySearchArray(collections.fileCommitStakeholderConnections, connection._id, 'from');
            //for each of the ownership connections, add the signature of the stakeholder and the owned lines to fileResult.ownership
            for (const ownershipConn of relevantOwnershipConnections) {
              const stakeholder = collections.stakeholders[ownershipConn.to];
              res.ownership.push({ stakeholder: stakeholder, hunks: ownershipConn.hunks });
            }

            return res;
          }
        });
        result.push(commit);
      }

      return result;
    });
  }

  // Note: very slow implementation. If this function is needed, rewrite it similarly to ./commits.js `getOwnershipDataForCommits`
  static getCommitsForFiles(db, relations, filenames, omitFiles) {
    if (filenames.length === 0) {
      return [];
    }
    return findAll(db, 'files').then(async (res) => {
      let files = res.docs;
      files = files.filter((f) => filenames.includes(f.path));

      //this stores the hashes of the commits associated to the given filenames
      const resultCommitHashes = [];

      //stores file objects for commit hashes. Add this to the commit objects later
      const filesForCommits = {};

      //edges in the db between files and commits
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;

      for (const file of files) {
        //get the connections from the current file to commits
        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.from === file._id);
        for (const connection of relevantConnections) {
          //if we also want file objects in our commit objects,
          // we have to push the file object to an intermediary array to add to the commits later
          if (!omitFiles) {
            let fileArray = [];
            if (filesForCommits[connection.to] !== null && filesForCommits[connection.to] !== undefined) {
              fileArray = filesForCommits[connection.to];
            }
            fileArray.push({ file: { path: file.path } });
            filesForCommits[connection.to] = fileArray;
          }

          //if this commit was not already connected to another file, push it to the array
          if (resultCommitHashes.includes(connection.to)) {
            continue;
          }
          resultCommitHashes.push(connection.to);
        }
      }

      //get whole commit objects from hashes
      let resultCommits = (await findAllCommits(db, relations)).docs.filter((c) => resultCommitHashes.includes(c.sha));

      //if we also want file objects in our commit objects, add them now
      if (!omitFiles) {
        resultCommits = resultCommits.map((commit) => {
          const c = commit;
          c.files = { data: filesForCommits[commit._id] };
          return c;
        });
      }
      return resultCommits;
    });
  }

  static async getOwnershipDataForCommit(db, relations, sha) {
    const res = await findCommit(db, relations, sha);
    const commit = res.docs[0];
    const collections = await this.fetchAndSortOwnershipCollections(db, relations);
    return this.extractOwnershipDataForCommit(commit, collections);
  }

  static async getOwnershipDataForCommits(db, relations) {
    return findAllCommits(db, relations).then(async (res) => {
      const commits = res.docs;
      const collections = await this.fetchAndSortOwnershipCollections(db, relations);
      //find commits-files connections for each commit
      return commits.map((commit) => {
        return this.extractOwnershipDataForCommit(commit, collections);
      });
    });
  }

  static getCodeHotspotsChangeData(db, relations, file) {
    return findFile(db, file).then(async (resFile) => {
      const file = resFile.docs[0];
      const allCommits = (await findAllCommits(db, relations)).docs;

      const fileCommitConnections = (await findFileCommitConnections(relations)).docs.filter((fCC) => fCC.from === file._id);
      let commits = [];
      for (const fileCommitConnection of fileCommitConnections) {
        const commit = allCommits.filter((c) => c._id === fileCommitConnection.to)[0];
        if (commit) {
          commit.file = { file: {} };
          commit.file.file.path = file.path;
          commit.file.lineCount = fileCommitConnection.lineCount;
          commit.file.hunks = fileCommitConnection.hunks;
          commits.push(commit);
        }
      }
      commits = commits.sort((a, b) => new Date(a.date) - new Date(b.date));
      return { file: { commits: { data: commits } } };
    });
  }

  // Helper functions

  static extractOwnershipDataForCommit(commit, collections) {
    const commitResult = { sha: commit.sha, date: commit.date, files: [] };
    const relevantConnections = binarySearchArray(collections.fileCommitConnections, commit._id, 'to');
    for (const conn of relevantConnections) {
      const relevantFile = binarySearch(collections.files, conn.from, '_id');
      const fileResult = { path: relevantFile.path, action: conn.action, ownership: [] };
      const relevantOwnershipConnections = binarySearchArray(collections.fileCommitStakeholderConnections, conn._id, 'from');

      //for each of the ownership connections, add the signature of the stakeholder and the owned lines to fileResult.ownership
      for (const ownershipConn of relevantOwnershipConnections) {
        const stakeholder = collections.stakeholders[ownershipConn.to];
        fileResult.ownership.push({ stakeholder: stakeholder, hunks: ownershipConn.hunks });
      }
      //add to the result object of the current file
      commitResult.files.push(fileResult);
    }
    return commitResult;
  }

  // gets all collections needed for ownership-related computations.
  // sorts the arrays so they can be used for binary search later on (see for example `extractOwnershipDataForCommit()`).
  static async fetchAndSortOwnershipCollections(db, relations) {
    let files = [];
    let stakeholdersObjects = [];
    let fileCommitConnections = [];
    let fileCommitStakeholderConnections = [];

    await Promise.all([
      findAll(db, 'files'),
      findAll(db, 'stakeholders'),
      findFileCommitConnections(relations),
      findFileCommitStakeholderConnections(relations),
    ]).then(([f, s, fc, fcs]) => {
      files = f.docs;
      stakeholdersObjects = s.docs;
      fileCommitConnections = fc.docs;
      fileCommitStakeholderConnections = fcs.docs;
    });
    // sort the collections, so we can use binary search later on
    files = sortByAttributeString(files, '_id');
    fileCommitConnections = sortByAttributeString(fileCommitConnections, 'to');
    fileCommitStakeholderConnections = sortByAttributeString(fileCommitStakeholderConnections, 'from');

    // we don't expect the stakeholders collection to be very large, so we can store it in a map for quicker access
    const stakeholders = {};
    stakeholdersObjects.map((s) => {
      stakeholders[s._id] = s.gitSignature;
    });

    return {
      files: files,
      stakeholders: stakeholders,
      fileCommitConnections: fileCommitConnections,
      fileCommitStakeholderConnections: fileCommitStakeholderConnections,
    };
  }
}
