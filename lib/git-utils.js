'use strict';

const Git = require('nodegit');
const fs = require('fs');
const Promise = require('bluebird');
const Repository = require('./git.js');

module.exports = {
  /**
   * Clones a GitHub project if it does not exist.
   * Fetches changes if it already exists.
   * @param projectsProjectPath {string} path where the project should be cloned to/where the project lies
   * @param projectsUrl {string} the url/path of the repository
   * @param cloneOptions {Git.CloneOptions}
   * @param shouldCopyOriginUrl {boolean}
   * @returns {Promise<string>} message if the project was cloned or fetched
   */
  fetchOrCloneRepo: function (
    projectsProjectPath,
    projectsUrl,
    cloneOptions = new Git.CloneOptions(),
    shouldCopyOriginUrl = false
  ) {
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
      return (
        Git.Clone.clone(projectsUrl, projectsProjectPath, cloneOptions)
          .then((clonedRepository) => {
            let promiseOriginUrl = Promise.resolve();

            // when the repository is cloned from a local repository, the path to the folder will be set as remote
            // this will lead to errors when trying to getting the owner/repo of the originUrl
            // therefore, get the originUrl from the original repository and set it in the cloned one
            if (shouldCopyOriginUrl) {
              promiseOriginUrl = Repository.fromPath(projectsUrl).then((repo) => repo.getOriginUrl());

              // set the baseProject as 'root' remote in order to get the local branches
            }

            return Promise.join(promiseOriginUrl, clonedRepository);
          })
          .then(([originUrl, clonedRepository]) => {
            let rootRemotePromise = Promise.resolve();
            // if originUrl is provided, a local repository was cloned -> set its origin url,
            // because Repository.fromPath is only possible with the HTTP path,
            // and not the local one
            if (originUrl) {
              Git.Remote.setUrl(clonedRepository, 'origin', originUrl);
              rootRemotePromise = Repository.fromPath(projectsProjectPath).then((repo) =>
                Git.Remote.create(repo.repo, 'root', projectsUrl)
              );
            }
            return Promise.join(clonedRepository, rootRemotePromise);
          })
          // fetch in the previously cloned repository
          .then(([clonedRepository]) =>
            clonedRepository.fetchAll({
              prune: Git.Fetch.PRUNE.GIT_FETCH_PRUNE,
            })
          )
          .then(() =>
            Promise.resolve(`Cloned repository ${projectsUrl} to ${projectsProjectPath}.`)
          )
      );
    }
  },
};
