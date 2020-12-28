'use strict';

const log = require('debug')('srv');
const ctx = require('../context.js');
const { io } = require('../context.js');
const config = require('../config.js');
const Git = require('nodegit');
const fs = require('fs');
const Repository = require('../git');
const ProgressReporter = require('../progress-reporter');
const idx = require('../indexers');

// TODO: add logs, error handling, put indexer in context and stop indexing when stopping the program
module.exports = function (req, res) {
  const repo = req.body.project;
  const owner = req.body.owner;

  // construct the path where the project should be cloned at/where the project is stored
  const projectsPath = config.get('projectsPath');
  if (!projectsPath) {
    // TODO: error handling
  }
  const projectsOwnerPath = `${projectsPath}/${owner}`;
  const projectsProjectPath = `${projectsOwnerPath}/${repo}`;

  // fetch or clone the repository
  return fetchOrCloneRepo(projectsProjectPath, owner, repo)
    .then((message) => {
      // get the repository from the path
      log(message);
      return Repository.fromPath(projectsProjectPath);
    })
    .then((repository) => {
      // index the repository
      let reporter = new ProgressReporter(io, ['commits', 'issues', 'builds']);
      let indexer = idx.makeVCSIndexer(repository, reporter);
      return indexer.index();
    })
    .then(() => {
      log('finished indexing repository', `${owner}/${repo}`);
      res.json({});
    });
};

/**
 * Clones a GitHub project if it does not exist.
 * Fetches changes if it already exists.
 * @param projectsProjectPath {string} path where the project should be cloned to/where the project lies
 * @param owner {string} owner of the project
 * @param repo {string} name of the project
 * @returns {Promise<string>} message if the project was cloned or fetched
 */
const fetchOrCloneRepo = (projectsProjectPath, owner, repo) => {
  // chech if the project already exists
  if (fs.existsSync(projectsProjectPath)) {
    // yes: fetch changes
    return Repository.fromPath(projectsProjectPath)
      .then((repo) => {
        return repo.repo.fetchAll({
          prune: Git.Fetch.PRUNE.GIT_FETCH_PRUNE,
        });
      })
      .then(() => Promise.resolve(`Fetched repository ${owner}/${repo}`));
  } else {
    // no: clone the repository
    return Git.Clone.clone(
      `https://github.com/${owner}/${repo}.git`,
      projectsProjectPath
    ).then(() => () => Promise.resolve(`Cloned repository ${owner}/${repo}`));
  }
};
