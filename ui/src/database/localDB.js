'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBAdapterMemory);

import Bounds from './localDB/bounds';
import Commits from './localDB/commits';
import Builds from './localDB/builds';
import Issues from './localDB/issues';
import Files from './localDB/files';
import Branches from './localDB/branches';
import Languages from './localDB/languages';
import Modules from './localDB/modules';
import Stakeholders from './localDB/stakeholders';

import branches from '../../db_export/branches.json';
import builds from '../../db_export/builds.json';
import commitsCommits from '../../db_export/commits-commits.json';
import commitsFiles from '../../db_export/commits-files.json';
import commitsLanguages from '../../db_export/commits-languages.json';
import commitsModules from '../../db_export/commits-modules.json';
import commitsStakeholders from '../../db_export/commits-stakeholders.json';
import commits from '../../db_export/commits.json';
import files from '../../db_export/files.json';
import issuesCommits from '../../db_export/issues-commits.json';
import issuesStakeholders from '../../db_export/issues-stakeholders.json';
import issues from '../../db_export/issues.json';
import languagesFiles from '../../db_export/languages-files.json';
import languages from '../../db_export/languages.json';
import modulesFiles from '../../db_export/modules-files.json';
import modulesModules from '../../db_export/modules-modules.json';
import modules from '../../db_export/modules.json';
import stakeholders from '../../db_export/stakeholders.json';

const collections = { branches, builds, commits, files, issues, languages, modules, stakeholders };

const relations = {
  'commits-commits': commitsCommits,
  'commits-files': commitsFiles,
  'commits-languages': commitsLanguages,
  'commits-modules': commitsModules,
  'commits-stakeholders': commitsStakeholders,
  'issues-commits': issuesCommits,
  'issues-stakeholders': issuesStakeholders,
  'languages-files': languagesFiles,
  'modules-files': modulesFiles,
  'modules-modules': modulesModules,
};

// create database, index on _id and triple store
const db = new PouchDB('Binocular_collections', { adapter: 'memory' });
const tripleStore = new PouchDB('Binocular_triple', { adapter: 'memory' });

db.createIndex({
  index: { fields: ['_id'] },
});

function importCollection(name) {
  collections[name].forEach((item) => {
    delete item._rev;
    delete item._key;

    db.put(item);
  });
}

function importRelation(name) {
  relations[name].forEach((item) => {
    delete item._rev;
    delete item._key;

    item.from = item._from;
    item.to = item._to;
    delete item._from;
    delete item._to;

    item.relation = name;
    tripleStore.put(item);
  });
}

function importData() {
  Object.keys(collections).forEach((name) => {
    console.log(`Importing collection ${name}`);

    importCollection(name);
  });

  Object.keys(relations).forEach((name) => {
    console.log(`Importing relation ${name}`);

    importRelation(name);
  });
}

export default class LocalDB {
  static initDB() {
    importData();
  }

  static getBounds() {
    return Bounds.getBounds(db);
  }

  static getCommitData(commitSpan, significantSpan) {
    return Commits.getCommitData(db, commitSpan, significantSpan);
  }

  static getBuildData(commitSpan, significantSpan) {
    return Builds.getBuildData(db, commitSpan, significantSpan);
  }

  static getIssueData(issueSpan, significantSpan) {
    return Issues.getIssueData(db, issueSpan, significantSpan);
  }

  static getCommitDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    return Commits.getCommitDataOwnershipRiver(db, commitSpan, significantSpan, granularity, interval);
  }

  static getBuildDataOwnershipRiver(commitSpan, significantSpan, granularity, interval) {
    return Builds.getBuildDataOwnershipRiver(db, commitSpan, significantSpan, granularity, interval);
  }

  static getIssueDataOwnershipRiver(issueSpan, significantSpan, granularity, interval) {
    return Issues.getIssueDataOwnershipRiver(db, issueSpan, significantSpan, granularity, interval);
  }

  static getRelatedCommitDataOwnershipRiver(issue) {
    return Commits.getRelatedCommitDataOwnershipRiver(db, issue);
  }

  static getCommitDateHistogram(granularity, dateField, since, until) {
    return Commits.getCommitDateHistogram(db, granularity, dateField, since, until);
  }

  static issueImpactQuery(iid, since, until) {
    return Issues.issueImpactQuery(db, tripleStore, iid, since, until);
  }

  static searchIssues(text) {
    return Issues.searchIssues(db, text);
  }

  static requestFileStructure() {
    return Files.requestFileStructure(db);
  }

  static getFileDataFileEvolutionDendrogram() {
    return Files.getFileDataFileEvolutionDendrogram(db, tripleStore);
  }

  static getAllBranches() {
    return Branches.getAllBranches(db);
  }

  static getAllLanguages() {
    return Languages.getAllLanguages(db);
  }

  static getAllModules() {
    return Modules.getAllModules(db);
  }

  static getAllStakeholders() {
    return Stakeholders.getAllStakeholders(db);
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
    database.commits_languages = relations['commits-languages'];
    database.commits_modules = relations['commits-modules'];
    database.commits_stakeholders = relations['commits-stakeholders'];
    database.issues_commits = relations['issues-commits'];
    database.issues_stakeholders = relations['issues-stakeholders'];
    database.languages_files = relations['languages-files'];
    database.modules_files = relations['modules-files'];
    database.modules_modules = relations['modules-modules'];

    return database;
  }
}
