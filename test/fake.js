'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const temp = Promise.promisifyAll(require('temp'));
const fs = require('fs-extra-promise');
const Random = require('random-js');
const path = require('path');
const nodegit = require('nodegit');
const faker = require('faker');
const fakerHelpers = require('faker/lib/helpers.js')(faker);
const firstNames = require('faker/lib/locales/en/name/first_name.js');
const lastNames = require('faker/lib/locales/en/name/last_name.js');
const emailProviders = require('faker/lib/locales/en/internet/free_email.js');
const lorem = require('lorem-ipsum');

const helpers = require('./helpers.js');
const Repository = require('../lib/core/provider/git.js');

const neutralVerbs = ['removed'];
const positiveVerbs = ['improved', 'added', 'refactored', 'adjusted', 'tweaked', ...neutralVerbs];
const negativeVerbs = ['fixed', 'repaired', ...neutralVerbs];

const neutralNouns = ['file', 'function', 'module', 'class', 'interface'];
const positiveNouns = ['feature', 'function', 'documentation', ...neutralNouns];
const negativeNouns = ['problem', 'bug', 'issue', ...neutralNouns];

const mt = Random.engines.mt19937();

// seed with a fixed value for reproducacble tests
mt.seed(4); // chosen by fair dice roll, guaranteed to be random ;)

const random = new Random(mt);

const fake = {
  integer: function(...args) {
    return random.integer(...args);
  },

  boolean: function(chanceOfTrue = 0.5) {
    return random.integer(0, 1000) / 1000 < chanceOfTrue;
  },

  repository: function(name) {
    return temp
      .mkdirAsync(null)
      .bind({})
      .then(function(dirPath) {
        if (name) {
          dirPath = path.join(dirPath, name);
        }

        this.repoPath = dirPath;
        return fs.emptyDirAsync(dirPath);
      })
      .then(function() {
        return nodegit.Repository.init(this.repoPath, 0);
      })
      .then(function(repo) {
        return Repository.fromRepo(repo);
      });
  },

  name: function() {
    return pickOne(firstNames) + ' ' + pickOne(lastNames);
  },

  email: function() {
    return fake.emailFor(fake.name());
  },

  emailFor: function(name) {
    return fakerHelpers.slugify(name) + '@' + pickOne(emailProviders);
  },

  signature: function() {
    return fake.signatureFor(fake.name());
  },

  file: function(dirPath, filePath, contents) {
    if (dirPath instanceof Repository) {
      dirPath = dirPath.getRoot();
    }

    const fullPath = path.join(dirPath, filePath);

    return fs.ensureFileAsync(fullPath).then(function() {
      return fs.writeFileAsync(fullPath, contents);
    });
  },

  stageFile: function(repo, filePath, contents) {
    return fake.file(repo.path, filePath, contents).then(function() {
      return helpers.stage(repo, filePath);
    });
  },

  signatureFor: function(name, email, date) {
    if (typeof date === 'undefined' && email instanceof Date) {
      date = email;
      email = null;
    }

    return nodegit.Signature.create(name, email || fake.emailFor(name), (date || new Date()).getTime(), 0);
  },

  lorem: function(count) {
    const units = ['paragraphs', 'sentences', 'words'];

    const ret = {};

    _.each(units, function(unit) {
      ret[unit] = () => lorem({ count, units: unit });
    });

    return ret;
  },

  message: function() {
    let verbs, nouns;
    if (fake.boolean(0.7)) {
      [verbs, nouns] = [positiveVerbs, positiveNouns];
    } else {
      [verbs, nouns] = [negativeVerbs, negativeNouns];
    }

    return pickOne(verbs) + ' ' + pickOne(nouns);
  },

  hex: function(len) {
    return random.hex(len);
  },

  shuffle: function(array) {
    return random.shuffle(array);
  }
};

module.exports = fake;

function pickOne(array) {
  return array[fake.integer(0, array.length - 1)];
}
