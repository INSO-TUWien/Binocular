'use strict';

const gitUtils = require('../git-utils.js');
const Git = require('nodegit');
const fsExtra = require('fs-extra');
const { execSync } = require('child_process');

module.exports = function (req, res) {
  let fromRepo = req.body.fromRepo; // repository of the branch to merge
  let fromBranch = req.body.fromBranch; // branch which should be merged into another one
  const toRepo = req.body.toRepo; // repository which should be merged into
  let toBranch = req.body.toBranch; // branch which should be merged into

  // get the default identity of the root repository
  const rootProject = gitUtils.getRootRepositoryID();

  // check if the toRepo is equal to the base project and
  // and if the toRepo is equal to the fromRepo
  // if the the toBranch is a remote one (origin)
  // only necessary for the base project, because of the local branches
  if (toRepo === rootProject && toRepo === fromRepo && !toBranch.startsWith('origin/')) {
    // yes: change remote to root
    toBranch = `root/${toBranch}`;
  }

  // get the path where all the cloned projects are located
  const projectsPath = gitUtils.getProjectsPath();

  // create the path of the baseProject
  const toRepoPath = `${projectsPath}/${toRepo}`;
  const toRepoBackupPath = `${toRepoPath}Backup`;

  return (
    Promise.resolve()
      .then(() => {
        // check if the toRepo is the root repo and if its already cloned
        // if its not cloned -> clone it
        // this check is only necessary for the rootRepo, because all other repos
        // will be cloned when selecting them in the UI and run the project indexing
        gitUtils.cloneRootProjectFromLocal(rootProject, toRepo, toRepoPath);

        // create a local copy of the base repo as backup
        // duration should not be high, because the folder should only contain
        // checked in files
        fsExtra.copySync(toRepoPath, toRepoBackupPath);

        // get the origin url from the fromRepo just in case if a new remote must be set
        let fromRepoOriginUrl = new TextDecoder()
          .decode(execSync(`cd ${projectsPath}/${fromRepo} && git config --get remote.origin.url`))
          .trim();

        // create a remote if necessary
        fromBranch = gitUtils.createRemoteAndFetch(
          toRepoPath,
          toRepo,
          fromRepo,
          fromBranch,
          fromRepoOriginUrl
        );

        // check out the branch
        gitUtils.cleanRepoAndCheckOutBranch(toRepoPath, toBranch);

        // merge fromBranch into toBranch
        try {
          execSync(`cd ${toRepoPath} && git merge ${fromBranch}`);

          // no conflict occurred
          res.json({
            mergeCheck: {
              success: true,
              fromRepo: req.body.fromRepo,
              fromBranch: req.body.fromBranch,
              toRepo: req.body.toRepo,
              toBranch: req.body.toBranch,
            },
          });
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
          return Promise.resolve();
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
            return Promise.resolve();
          });
        }
      })
      // restore the previously created backup to revert the rebase
      .finally(() => {
        return gitUtils.restoreBackup(toRepoPath, toRepoBackupPath);
      })
  );
};
