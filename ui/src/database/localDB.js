'use strict';

import PouchDB from 'pouchdb-browser';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

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
const db = new PouchDB('Binocular_collections_' + Date.now());
const tripleStore = new PouchDB('Binocular_triple_' + Date.now());

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
  db.info().then((res) => {
    if (res.doc_count === 0) {
      Object.keys(collections).forEach((name) => {
        console.log(`Importing collection ${name}`);

        importCollection(name);
      });
    }
  });

  // import relations iff triple store does not already exist
  tripleStore.info().then((res) => {
    if (res.doc_count === 0) {
      Object.keys(relations).forEach((name) => {
        console.log(`Importing relation ${name}`);

        importRelation(name);
      });
    }
  });
}

// find all of given collection (example _id field for e.g. issues looks like 'issues/{issue_id}')
function findAll(collection) {
  return db.find({
    selector: { _id: { $regex: new RegExp(`^${collection}\/.*`) } },
  });
}

export default class LocalDB {
  static initDB() {
    importData();
  }

  static getBounds() {
    return Promise.all([findAll('stakeholders'), findAll('commits'), findAll('issues')]).then((res) => {
      console.log(res);
      const response = { committers: [] };

      // all committers
      res[0].docs.forEach((doc) => response.committers.push(doc.gitSignature));

      // first and last commit
      res[1].docs = res[1].docs.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      response.firstCommit = res[1].docs[0];
      response.lastCommit = res[1].docs[res[1].docs.length - 1];

      // first and last issue
      res[2].docs = res[2].docs.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

      response.firstIssue = res[2].docs[0];
      response.lastIssue = res[2].docs[res[2].docs.length - 1];

      return response;
    });
  }

  static getCommitData(commitSpan, significantSpan) {
    // return all commits, filtering according to parameters can be added in the future
    return findAll('commits').then((res) => {
      res.docs = res.docs.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

      return res.docs;
    });
  }
}
