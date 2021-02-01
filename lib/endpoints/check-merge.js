'use strict';

const log = require('debug')('srv');
const Repository = require('../git.js');
const gitUtils = require('../git-utils.js');
const Git = require('nodegit');
const Promise = require('bluebird');
const fsExtra = require('fs-extra');
const { execSync } = require('child_process');

module.exports = function (req, res) {
  let fromRepo = req.body.fromRepo; // repository of the branch to rebase
  let fromBranch = req.body.fromBranch; // branch which should be rebased onto another one
  const toRepo = req.body.toRepo; // repository which should be rebased on
  let toBranch = req.body.toBranch; // branch which should be rebased on

  let toRepository; // the repository from which the branch should be rebased

  // get the default identity of the root repository
  const rootProject = gitUtils.getRootRepositoryID();

  // check if the to is equal to the base project and
  // if the the toBranch is a remote one (origin)
  if (toRepo === rootProject && !toBranch.startsWith('origin/')) {
    // yes: change remote to root
    toBranch = `root/${toBranch}`;
  }

  // get the path where all the cloned projects are located
  const projectsPath = gitUtils.getProjectsPath();

  // create the path of the baseProject
  const toRepoPath = `${projectsPath}/${toRepo}`;
  const toRepoBackupPath = `${toRepoPath}Backup`;

  let fromRepoOriginUrl;

  return (
    // check if the toRepo is the root repo and if its already cloned
    // if its not cloned -> clone it
    // this check is only necessary for the rootRepo, because all other repos
    // will be cloned when selecting them in the UI and run the project indexing
    gitUtils
      .cloneRootProjectFromLocal(rootProject, toRepo, toRepoPath)
      // create a local copy of the base repo as backup
      // duration should not be high, because the folder should only contain
      // checked in files
      .then(() => {
        return fsExtra.copy(toRepoPath, toRepoBackupPath);
      })
      // get the origin url from the fromRepo just in case if a new remote must be set
      .then(() => Repository.fromPath(`${projectsPath}/${fromRepo}`))
      .then((fromRepository) => fromRepository.getOriginUrl())
      .then((_fromRepoOriginUrl) => (fromRepoOriginUrl = _fromRepoOriginUrl))
      // open the rebaseRepo
      .then(() =>
        Repository.fromPath(toRepoPath)
          // save the opened repository for a later use
          .then((_toRepository) => {
            toRepository = _toRepository;
            return Promise.resolve();
          })
          // if the toRepo is different than the fromRepo, get all remotes
          // to check if the fromRepo remote is already set
          .then(() => {
            if (toRepo === fromRepo) {
              fromRepo = '';
              return Promise.resolve();
            }
            return Git.Remote.list(toRepository.repo);
          })
          // if the remote is not set in the toRepo -> create the remote
          .then((remoteNames) => {
            if (remoteNames && !remoteNames.includes(fromRepo)) {
              fromBranch = !fromBranch.startsWith('origin/') ? `${fromRepo}/${fromBranch}` : `${fromRepo}/${fromBranch.replace('origin/', '')}`;
              return Git.Remote.create(toRepository.repo, fromRepo, fromRepoOriginUrl);
            }
            return Promise.resolve();
          })
          .then(() =>
            toRepository.repo.fetchAll({
              prune: Git.Fetch.PRUNE.GIT_FETCH_PRUNE,
            })
          )
          // perform the merge using the command line, because in nodegit the merge will not be written to the filesystem
          // if a merge occurs, but this is necessary to get the merged view of the conflicting file
          .then(() => {
            // remove all possible remaining changes, is not problematic because these repos should be only used
            // internally as safety copy, such that no unintentional changes will be done in the root repository
            // and no user should work in these
            execSync(`cd ${toRepoPath} && git reset -q --hard HEAD && git clean -fdxq`);

            // check out the branch which should be merged into
            try {
              execSync(`cd ${toRepoPath} && git checkout ${toBranch} -q`);
            } catch (ex) {
              // branch already checked out -> ignore
            }

            // remove all possible remaining changes, is not problematic because these repos should be only used
            // internally as safety copy, such that no unintentional changes will be done in the root repository
            // and no user should work in these
            execSync(`cd ${toRepoPath} && git reset -q --hard HEAD && git clean -fdxq`);

            // merge fromBranch into toBranch
            try {
              execSync(`cd ${toRepoPath} && git merge ${fromBranch}`);
            } catch (ex) {
              // a conflict occurred
              return Promise.resolve(false);
            }
            // no conflict occurred
            return Promise.resolve(true);
          })
          .then((success) => {
            // the merge was successful -> return the response
            if (success) {
              res.json({
                mergeCheck: {
                  success: true,
                  fromRepo: req.body.fromRepo,
                  fromBranch: req.body.fromBranch,
                  toRepo: req.body.toRepo,
                  toBranch: req.body.toBranch,
                },
              });
            } else {
              // the merge resulted in a conflict -> get the conflict metadata and return them
              return Git.Index.open(`${toRepoPath}/.git/index`).then((index) => {
                // get the conflict metadata
                const conflictDatas = gitUtils.getConflictData(index, toRepoPath);

                // return all conflict data
                res.json({
                  mergeCheck: {
                    success: false,
                    fromRepo: req.body.fromRepo,
                    fromBranch: req.body.fromBranch,
                    toRepo: req.body.toRepo,
                    toBranch: req.body.toBranch,
                    conflictDatas: conflictDatas,
                  },
                });
              });
            }
          })
          // restore the previously created backup to revert the rebase
          .finally(() => {
            gitUtils.restoreBackup(toRepoPath, toRepoBackupPath);
          })
      )
  );
};
