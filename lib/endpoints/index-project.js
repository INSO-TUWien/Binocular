'use strict';

const log = require('debug')('srv');
const ctx = require('../context.js');
const { io } = require('../context.js');
const config = require('../config.js');
const Git = require('nodegit');
const fs = require('fs');
const Promise = require('bluebird');
const Repository = require('../git');
const ProgressReporter = require('../progress-reporter');
const idx = require('../indexers');

// TODO: add logs, error handling, put indexer in context and stop indexing when stopping the program
module.exports = function (req, res) {
  // get the metadata of the parent/fork from the base project which should be indexed
  const repo = req.body.project;
  const owner = req.body.owner;

  // construct the path where the project should be cloned at/where the project is stored
  const projectsPath = config.get('projectsPath');
  if (!projectsPath) {
    // TODO: error handling
  }

  // fetch or clone the parent/fork of the base project
  const projectsOwnerPath = `${projectsPath}/${owner}`;
  const projectsProjectPath = `${projectsOwnerPath}/${repo}`;
  const projectsUrl = `https://github.com/${owner}/${repo}.git`;
  const projectPromise = fetchOrCloneRepo(projectsProjectPath, projectsUrl);

  // clone/fetch the base project locally from the path
  // is needed to also get the local commits of the repo and
  // to prevent unwanted changes of the original while trying to rebase, merge or cherry pick
  const projectsBaseProjectPath = `${projectsPath}/${ctx.repo.getOwner()}/${ctx.repo.getName()}`;
  const cloneOptionsBaseProject = new Git.CloneOptions();
  cloneOptionsBaseProject.local = Git.Clone.LOCAL.LOCAL;
  const baseProjectPromise = fetchOrCloneRepo(
    projectsBaseProjectPath,
    ctx.targetPath,
    cloneOptionsBaseProject,
    true
  );

  return Promise.join(projectPromise, baseProjectPromise)
    .then(([messageProject, messageBaseProject]) => {
      // log messages if the projects were cloned or fetched
      log(messageProject);
      log(messageBaseProject);

      // get the repository from the path
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
 * @param projectsUrl {string} the url/path of the repository
 * @param cloneOptions {Git.CloneOptions}
 * @param shouldCopyOriginUrl {boolean}
 * @returns {Promise<string>} message if the project was cloned or fetched
 */
const fetchOrCloneRepo = (
  projectsProjectPath,
  projectsUrl,
  cloneOptions = new Git.CloneOptions(),
  shouldCopyOriginUrl = false
) => {
  // check if the project already exists
  if (fs.existsSync(projectsProjectPath)) {
    // yes: fetch changes
    return Repository.fromPath(projectsProjectPath)
      .then((repo) => {
        return repo.repo.fetchAll({
          prune: Git.Fetch.PRUNE.GIT_FETCH_PRUNE,
        });
      })
      .then(() => Promise.resolve(`Fetched repository ${projectsProjectPath}`));
  } else {
    // no: clone the repository
    return Git.Clone.clone(projectsUrl, projectsProjectPath, cloneOptions)
      .then((clonedRepository) => {
        let promiseOriginUrl = Promise.resolve();
        // when the repository is cloned from a local repository, the path to the folder will be set as remote
        // this will lead to errors when trying to getting the owner/repo of the originUrl
        // therefore, get the originUrl from the original repository and set it in the cloned one
        if (shouldCopyOriginUrl) {
          promiseOriginUrl = Repository.fromPath(projectsUrl).then((repo) => repo.getOriginUrl());
        }
        return Promise.join(promiseOriginUrl, clonedRepository);
      })
      .then(([originUrl, clonedRepository]) => {
        if (originUrl) {
          Git.Remote.setUrl(clonedRepository, 'origin', originUrl);
        }
        return Promise.resolve(`Cloned repository ${projectsUrl} to ${projectsProjectPath}.`);
      });
  }
};
