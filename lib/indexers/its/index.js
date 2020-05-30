'use strict';

const GenericImporter = require('../../importer/GenericImporter');

let provider;

const components = {
  github: require('./GitHubIndexer.js'),
  gitlab: require('./GitLabITSIndexer.js')
};

module.exports = async (repo, reporter) => (provider ? provider : (provider = await GenericImporter(repo, 'ITS', components, reporter)));
