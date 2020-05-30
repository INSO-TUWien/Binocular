'use strict';

const GenericImporter = require('../importer/GenericImporter');

let provider;

const components = {
  github: require('./GitHubUrlProvider.js'),
  gitlab: require('./GitLabUrlProvider.js')
};

module.exports = async repo => (provider ? provider : (provider = await GenericImporter(repo, 'VCS', components)));
