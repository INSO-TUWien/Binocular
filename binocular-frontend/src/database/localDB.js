'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
import WorkerPouch from 'worker-pouch';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);
PouchDB.adapter('worker', WorkerPouch);

import Bounds from './localDB/bounds';
import Commits from './localDB/commits';
import Builds from './localDB/builds';
import Issues from './localDB/issues';
import MergeRequests from './localDB/mergeRequests';
import Milestones from './localDB/milestones';
import Files from './localDB/files';
import Branches from './localDB/branches';
import Modules from './localDB/modules';
import Users from './localDB/users';

// #v-ifdef VITE_OFFLINE
import branches from '../../db_export/branches.json';
import branchesFiles from '../../db_export/branches-files.json';
import branchesFilesFiles from '../../db_export/branches-files-files.json';
import builds from '../../db_export/builds.json';
import commitsCommits from '../../db_export/commits-commits.json';
import commitsFiles from '../../db_export/commits-files.json';
import commitsBuilds from '../../db_export/commits-builds.json';
import commitsFilesUsers from '../../db_export/commits-files-users.json';
import commitsModules from '../../db_export/commits-modules.json';
import commitsUsers from '../../db_export/commits-users.json';
import commits from '../../db_export/commits.json';
import files from '../../db_export/files.json';
import issuesCommits from '../../db_export/issues-commits.json';
import issuesUsers from '../../db_export/issues-users.json';
import issues from '../../db_export/issues.json';
import modulesFiles from '../../db_export/modules-files.json';
import modulesModules from '../../db_export/modules-modules.json';
import modules from '../../db_export/modules.json';
import users from '../../db_export/users.json';
import mergeRequests from '../../db_export/mergeRequests.json';
import milestones from '../../db_export/milestones.json';
import issuesMilestones from '../../db_export/issues-milestones.json';
import mergeRequestsMilestones from '../../db_export/mergeRequests-milestones.json';
import accounts from '../../db_export/accounts.json';
import issuesAccounts from '../../db_export/issues-accounts.json';
import mergeRequestsAccounts from '../../db_export/mergeRequests-accounts.json';
import notes from '../../db_export/notes.json';
import issuesNotes from '../../db_export/issues-notes.json';
import mergeRequestsNotes from '../../db_export/mergeRequests-notes.json';
import notesAccounts from '../../db_export/notes-accounts.json';
import { decompressJson } from '../../../utils/json-utils.ts';

const collections = { accounts, branches, builds, commits, files, issues, modules, users, mergeRequests, milestones, notes };

const relations = {
  'commits-commits': commitsCommits,
  'commits-files': commitsFiles,
  'commits-files-users': commitsFilesUsers,
  'commits-builds': commitsBuilds,
  'commits-modules': commitsModules,
  'commits-users': commitsUsers,
  'issues-commits': issuesCommits,
  'issues-users': issuesUsers,
  'issues-accounts': issuesAccounts,
  'issues-milestones': issuesMilestones,
  'modules-files': modulesFiles,
  'modules-modules': modulesModules,
  'mergeRequests-accounts': mergeRequestsAccounts,
  'mergeRequests-milestones': mergeRequestsMilestones,
  'branches-files': branchesFiles,
  'branches-files-files': branchesFilesFiles,
  'issues-notes': issuesNotes,
  'mergeRequests-notes': mergeRequestsNotes,
  'notes-accounts': notesAccounts,
};
// #v-endif

let db;
let tripleStore;

const assignDB = (adapter) => {
  db = new PouchDB('Binocular_collections', { adapter: adapter });
  tripleStore = new PouchDB('Binocular_triple', { adapter: adapter });
};

const preprocessCollection = (coll) => {
  return coll.map((i) => {
    // key and rev not needed for pouchDB
    delete i._key;
    delete i._rev;
    // rename _from/_to if this is a connection
    if (i._from !== undefined) {
      i.from = i._from;
      i.to = i._to;
      delete i._from;
      delete i._to;
    }
    return i;
  });
};

function importCollection(name) {
  // first decompress the json file, then remove attributes that are not needed by PouchDB
  db.bulkDocs(preprocessCollection(decompressJson(name, collections[name])));
}

function importRelation(name) {
  // first decompress the json file, then remove attributes that are not needed by PouchDB
  tripleStore.bulkDocs(preprocessCollection(decompressJson(name, relations[name])));
}

function importData() {
  Object.keys(collections).map((name) => {
    console.log(`Importing collection ${name}`);
    importCollection(name);
  });

  Object.keys(relations).map((name) => {
    console.log(`Importing relation ${name}`);
    importRelation(name);
  });
}

export default class LocalDB {
  static async initDB() {
    // check if web workers are supported
    return WorkerPouch.isSupportedBrowser().then((supported) => {
      if (supported) {
        // using web workers does not block the main thread, making the UI load faster.
        // note: worker adapter does not support custom indices!
        assignDB('worker');
      } else {
        assignDB('memory');
      }
      importData();
    });
  }

  static getBounds() {
    return Bounds.getBounds(db);
  }

  static getCommitData(commitSpan, significantSpan) {
    return Commits.getCommitData(db, tripleStore, commitSpan, significantSpan);
  }

  static getCommitDataForSha(sha) {
    return Commits.getCommitDataForSha(db, tripleStore, sha);
  }

  static getBuildData(commitSpan, significantSpan) {
    return Builds.getBuildData(db, tripleStore, commitSpan, significantSpan);
  }

  static getIssueData(issueSpan, significantSpan) {
    return Issues.getIssueData(db, tripleStore, issueSpan, significantSpan);
  }

  static getCommitsForIssue(iid) {
    return Issues.getCommitsForIssue(db, tripleStore, iid);
  }

  static getMergeRequestData(mergeRequestSpan, significantSpan) {
    return MergeRequests.getMergeRequestData(db, tripleStore, mergeRequestSpan, significantSpan);
  }

  static getMilestoneData() {
    return Milestones.getMilestoneData(db);
  }

  static getCommitsForFiles(filenames) {
    return Commits.getCommitsForFiles(db, tripleStore, filenames, true);
  }

  static getCommitsWithFilesForFiles(filenames) {
    return Commits.getCommitsForFiles(db, tripleStore, filenames, false);
  }

  static getCommitDataWithFiles(commitSpan, significantSpan) {
    return Commits.getCommitDataWithFiles(db, tripleStore, commitSpan, significantSpan);
  }

  static getCommitDataWithFilesAndOwnership(commitSpan, significantSpan) {
    return Commits.getCommitDataWithFilesAndOwnership(db, tripleStore, commitSpan, significantSpan);
  }

  static getOwnershipDataForCommit(sha) {
    return Commits.getOwnershipDataForCommit(db, tripleStore, sha);
  }

  static getOwnershipDataForCommits() {
    return Commits.getOwnershipDataForCommits(db, tripleStore);
  }

  static getOwnershipDataForFiles(files) {
    return Files.getOwnershipDataForFiles(db, tripleStore, files);
  }

  static issueImpactQuery(iid, since, until) {
    return Issues.issueImpactQuery(db, tripleStore, iid, since, until);
  }

  static searchIssues(text) {
    return Issues.searchIssues(db, tripleStore, text);
  }

  static requestFileStructure() {
    return Files.requestFileStructure(db);
  }

  static getFilesForCommits(hashes) {
    return Files.getFilesForCommits(db, tripleStore, hashes);
  }

  static getFilenamesForBranch(branchName) {
    return Files.getFilenamesForBranch(db, tripleStore, branchName);
  }

  static getPreviousFilenamesForFilesOnBranch(branchName) {
    return Files.getPreviousFilenamesForFilesOnBranch(db, tripleStore, branchName);
  }

  static getAllBranches() {
    return Branches.getAllBranches(db);
  }

  static getAllModules() {
    return Modules.getAllModules(db);
  }

  static getAllUsers() {
    return Users.getAllUsers(db);
  }

  static getCodeHotspotsChangeData(file) {
    return Commits.getCodeHotspotsChangeData(db, tripleStore, file);
  }

  static getCodeHotspotsIssueData(file) {
    return Issues.getCodeHotspotsIssueData(db, tripleStore, file);
  }

  static getDatabase() {
    const database = collections;

    //relations need to be mapped so that they have the same names as with the server based variant
    database.commits_commits = relations['commits-commits'];
    database.commits_files = relations['commits-files'];
    database.commits_files_users = relations['commits-files-users'];
    database.commits_builds = relations['commits-builds'];
    database.commits_modules = relations['commits-modules'];
    database.commits_users = relations['commits-users'];
    database.issues_commits = relations['issues-commits'];
    database.issues_users = relations['issues-users'];
    database.issues_accounts = relations['issues-accounts'];
    database.issues_milestones = relations['issues-milestones'];
    database.modules_files = relations['modules-files'];
    database.modules_modules = relations['modules-modules'];
    database.mergeRequests_accounts = relations['mergeRequests-accounts'];
    database.mergeRequests_milestones = relations['mergeRequests-milestones'];
    database.branches_files = relations['branches-files'];
    database.branches_files_files = relations['branches-files-files'];
    database.issues_notes = relations['issues-notes'];
    database.mergeRequests_notes = relations['mergeRequests-notes'];
    database.notes_accounts = relations['notes-accounts'];

    return database;
  }
}
