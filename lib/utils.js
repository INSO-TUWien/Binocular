'use strict';

const _ = require('lodash');
const archiver = require('archiver');
const stream = require('stream');
const { Octokit } = require('@octokit/rest');
const config = require('./config.js');

const GITHUB_ORIGIN_REGEX = /(?:git@github.com:|https:\/\/github.com\/)([^\/]+)\/(.*)\.git/;

module.exports = {
  createZipStream: function(directory) {
    const zip = archiver('zip');

    const pass = new stream.PassThrough();
    zip.pipe(pass);

    zip.directory(directory, false);
    zip.finalize();

    return pass;
  },

  renamer: function(mappings) {
    return function(obj) {
      const ret = {};
      _.each(mappings, function(to, from) {
        if (from in obj) {
          ret[to] = obj[from];
        }
      });

      return ret;
    };
  },

  /**
   * Returns the match, containing the owner and repoName of the provided repository (GitHub only).
   * @param repo the Repository
   * @returns {[string]} [1] = owner; [2] = repo
   */
  getGithubOwnerAndRepo: function (repo) {
    return repo.getOriginUrl().then((url) => {
      const match = url.match(GITHUB_ORIGIN_REGEX);
      if (!match) {
        throw new Error('Unable to determine github owner and repo from origin url: ' + url);
      }
      return match;
    });
  },

  /**
   * Returns an Octocit instance.
   * Supported auth methods (via config): token
   * @returns {Octokit}
   */
  getOctokit: function () {
    let auth;
    const authMethod = config.get('github.auth.type');
    switch (authMethod) {
      case 'token':
        auth = {
          auth: config.get('github.auth.token'),
        };
        break;
      default:
        throw new Error(
          'Selected authentication "${authMethod} not supported. Use the "token" method instead.'
        );
    }

    return new Octokit(auth);
  },
};
