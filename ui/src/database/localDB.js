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

import branches from '../../arango_export/branches.json';
import builds from '../../arango_export/builds.json';
import commitsCommits from '../../arango_export/commits-commits.json';
import commitsFiles from '../../arango_export/commits-files.json';
import commitsLanguages from '../../arango_export/commits-languages.json';
import commitsModules from '../../arango_export/commits-modules.json';
import commitsStakeholders from '../../arango_export/commits-stakeholders.json';
import commits from '../../arango_export/commits.json';
import files from '../../arango_export/files.json';
import issuesCommits from '../../arango_export/issues-commits.json';
import issuesStakeholders from '../../arango_export/issues-stakeholders.json';
import issues from '../../arango_export/issues.json';
import languagesFiles from '../../arango_export/languages-files.json';
import languages from '../../arango_export/languages.json';
import modulesFiles from '../../arango_export/modules-files.json';
import modulesModules from '../../arango_export/modules-modules.json';
import modules from '../../arango_export/modules.json';
import stakeholders from '../../arango_export/stakeholders.json';

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
  // import collections iff DB does not already exist
  /*db.info().then((res) => {
    console.log(res);
    if (res.doc_count === 0) {*/
  Object.keys(collections).forEach((name) => {
    console.log(`Importing collection ${name}`);

    importCollection(name);
  });

  /*  }
  });*/

  // import relations iff triple store does not already exist
  /*tripleStore.info().then((res) => {
    if (res.doc_count === 0) {*/
  Object.keys(relations).forEach((name) => {
    console.log(`Importing relation ${name}`);

    importRelation(name);
  });
  //  }
  //});
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
}
