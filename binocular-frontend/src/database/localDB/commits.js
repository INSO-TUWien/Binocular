'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import _ from 'lodash';
import moment from 'moment/moment';
import {
  findAll,
  findAllCommits,
  findCommit,
  findFile,
  findFileCommitConnections,
  findFileCommitStakeholderConnections,
  findCommitBuildConnections,
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
      const commits = res.docs
        .filter((c) => new Date(c.date) >= first && new Date(c.date) <= last)
        .sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      const allFiles = (await findAll(db, 'files')).docs;
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const fileCommitStakeholderConnections = (await findFileCommitStakeholderConnections(relations)).docs;
      const stakeholders = (await findAll(db, 'stakeholders')).docs;
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
            res.ownership = [];

            //find connections to stakeholders for ownership data
            const relevantOwnershipConnections = fileCommitStakeholderConnections.filter((fcsc) => fcsc.from === connection._id);
            //for each of the ownership connections, add the signature of the stakeholder and the owned lines to fileResult.ownership
            for (const ownershipConn of relevantOwnershipConnections) {
              const stakeholder = stakeholders.filter((s) => s._id === ownershipConn.to)[0].gitSignature;
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

  static getOwnershipDataForCommit(db, relations, sha) {
    return findCommit(db, relations, sha).then(async (res) => {
      const commit = res.docs[0];

      const files = (await findAll(db, 'files')).docs;
      const stakeholders = (await findAll(db, 'stakeholders')).docs;
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const fileCommitStakeholderConnections = (await findFileCommitStakeholderConnections(relations)).docs;

      const result = [];

      //find commits-files connection of this commit
      const relevantConnections = fileCommitConnections.filter((fCC) => fCC.to === commit._id);
      for (const conn of relevantConnections) {
        const relevantFile = files.filter((f) => f._id === conn.from)[0];

        const fileResult = { path: relevantFile.path, action: conn.action, ownership: [] };

        const relevantOwnershipConnections = fileCommitStakeholderConnections.filter((fcsc) => fcsc.from === conn._id);

        //for each of the ownership connections, add the signature of the stakeholder and the owned lines to fileResult.ownership
        for (const ownershipConn of relevantOwnershipConnections) {
          const stakeholder = stakeholders.filter((s) => s._id === ownershipConn.to)[0].gitSignature;
          fileResult.ownership.push({ stakeholder: stakeholder, hunks: ownershipConn.hunks });
        }
        //add to the result object of the current file
        result.push(fileResult);
      }

      return result;
    });
  }

  static getOwnershipDataForCommits(db, relations) {
    return findAllCommits(db, relations).then(async (res) => {
      const commits = res.docs;

      const files = (await findAll(db, 'files')).docs;
      const stakeholders = (await findAll(db, 'stakeholders')).docs;
      const fileCommitConnections = (await findFileCommitConnections(relations)).docs;
      const fileCommitStakeholderConnections = (await findFileCommitStakeholderConnections(relations)).docs;

      //find commits-files connections for each commit
      return commits.map((commit) => {
        const commitResult = { sha: commit.sha, date: commit.date, files: [] };
        const relevantConnections = fileCommitConnections.filter((fCC) => fCC.to === commit._id);
        for (const conn of relevantConnections) {
          const relevantFile = files.filter((f) => f._id === conn.from)[0];

          const fileResult = { path: relevantFile.path, action: conn.action, ownership: [] };

          const relevantOwnershipConnections = fileCommitStakeholderConnections.filter((fcsc) => fcsc.from === conn._id);

          //for each of the ownership connections, add the signature of the stakeholder and the owned lines to fileResult.ownership
          for (const ownershipConn of relevantOwnershipConnections) {
            const stakeholder = stakeholders.filter((s) => s._id === ownershipConn.to)[0].gitSignature;
            fileResult.ownership.push({ stakeholder: stakeholder, hunks: ownershipConn.hunks });
          }
          //add to the result object of the current file
          commitResult.files.push(fileResult);
        }
        return commitResult;
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
}
