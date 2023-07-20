'use strict';

const _ = require('lodash');
const temp = require('temp');
const fs = require('fs').promises;
const fse = require('fs-extra');
const Random = require('random-js');
const path = require('path');
const faker = require('faker');
const fakerHelpers = require('faker/lib/helpers.js')(faker);
const firstNames = require('faker/lib/locales/en/name/first_name.js');
const lastNames = require('faker/lib/locales/en/name/last_name.js');
const emailProviders = require('faker/lib/locales/en/internet/free_email.js');
const lorem = require('lorem-ipsum').loremIpsum;

const helpers = require('./helpers.js');
const Repository = require('../../../../lib/core/provider/git.js');

const neutralVerbs = ['removed'];
const positiveVerbs = ['improved', 'added', 'refactored', 'adjusted', 'tweaked', ...neutralVerbs];
const negativeVerbs = ['fixed', 'repaired', ...neutralVerbs];

const neutralNouns = ['file', 'function', 'module', 'class', 'interface'];
const positiveNouns = ['feature', 'function', 'documentation', ...neutralNouns];
const negativeNouns = ['problem', 'bug', 'issue', ...neutralNouns];

// seed with a fixed value for reproducible tests
const mt = Random.MersenneTwister19937.seed(4); // chosen by fair dice roll, guaranteed to be random ;)

const random = new Random.Random(mt);

const repositoryFake = {
  integer: function (...args) {
    return random.integer(...args);
  },

  boolean: function (chanceOfTrue = 0.5) {
    return random.integer(0, 1000) / 1000 < chanceOfTrue;
  },

  repository: function (name) {
    return temp
      .mkdir(null)

      .then((dirPath) => {
        if (name) {
          dirPath = path.join(dirPath, name);
        }

        this.repoPath = dirPath;
        return fse.emptyDir(dirPath);
      })
      .then(() => {
        return Repository.fromPath(this.repoPath);
      });
  },

  name: function () {
    return pickOne(firstNames) + ' ' + pickOne(lastNames);
  },

  email: function () {
    return repositoryFake.emailFor(repositoryFake.name());
  },

  emailFor: function (name) {
    return fakerHelpers.slugify(name) + '@' + pickOne(emailProviders);
  },

  signature: function () {
    return repositoryFake.signatureFor(repositoryFake.name());
  },

  file: function (dirPath, filePath, contents) {
    if (dirPath instanceof Repository) {
      dirPath = dirPath.getRoot();
    }

    const fullPath = path.join(dirPath, filePath);

    return fs.writeFile(fullPath, contents);
  },

  stageFile: function (repo, filePath, contents) {
    return repositoryFake.file(repo.path, filePath, contents).then(function () {
      return helpers.stage(repo, filePath);
    });
  },

  signatureFor: function (name, email, date) {
    if (typeof date === 'undefined' && email instanceof Date) {
      date = email;
      email = null;
    }

    //return nodegit.Signature.create(name, email || repositoryFake.emailFor(name), (date || new Date()).getTime(), 0);
    //no equivalent in isomorphic git to nodegit
    return {};
  },

  lorem: function (count) {
    const units = ['paragraphs', 'sentences', 'words'];

    const ret = {};

    _.each(units, function (unit) {
      ret[unit] = () => lorem({ count, units: unit });
    });

    return ret;
  },

  message: function () {
    let verbs, nouns;
    if (repositoryFake.boolean(0.7)) {
      [verbs, nouns] = [positiveVerbs, positiveNouns];
    } else {
      [verbs, nouns] = [negativeVerbs, negativeNouns];
    }

    return pickOne(verbs) + ' ' + pickOne(nouns);
  },

  hex: function (len) {
    return random.hex(len);
  },

  shuffle: function (array) {
    return random.shuffle(array);
  },
};

module.exports = repositoryFake;

function pickOne(array) {
  return array[repositoryFake.integer(0, array.length - 1)];
}
