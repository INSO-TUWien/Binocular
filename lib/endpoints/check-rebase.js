'use strict';

const gitUtils = require('../git-utils.js');
const Git = require('nodegit');
const fsExtra = require('fs-extra');
const { execSync } = require('child_process');

module.exports = function (req, res) {
  const headSha = req.body.headSha; // the sha rebaseRepo's the head commit
  const rebaseRepo = req.body.rebaseRepo; // repository of the branch to rebase
  const rebaseBranch = req.body.rebaseBranch; // branch which should be rebased onto another one
  let upstreamRepo = req.body.upstreamRepo; // repository which should be rebased on
  let upstreamBranch = req.body.upstreamBranch; // branch which should be rebased on

  let commitsOfRebase = []; // array which holds information about all commits of the rebase and if they were rebased successfully, introduced a conflict or were not analysed due to a previous conflict

  // get the default identity of the root repository
  const rootProject = gitUtils.getRootRepositoryID();

  // check if the upstreamRepo is equal to the base project and
  // the rebaseRepo is equal to the upstreamRepo and
  // if the the upstreamBranch is a remote one (origin)
  // only necessary for the base project, because of the local branches
  if (
    upstreamRepo === rootProject &&
    upstreamRepo === rebaseRepo &&
    !upstreamBranch.startsWith('origin/')
  ) {
    // yes: change remote to root
    upstreamBranch = `root/${upstreamBranch}`;
  }

  // get the path where all the cloned projects are located
  const projectsPath = gitUtils.getProjectsPath();

  // create the path of the baseProject
  const rebaseRepoPath = `${projectsPath}/${rebaseRepo}`;
  const rebaseRepoBackupPath = `${rebaseRepoPath}Backup`;

  return (
    Promise.resolve()
      .then(() => {
        // check if the rebaseRepo is the root repo and if its already cloned
        // if its not cloned -> clone it
        // this check is only necessary for the rootRepo, because all other repos
        // will be cloned when selecting them in the UI and run the project indexing
        gitUtils.cloneRootProjectFromLocal(rootProject, rebaseRepo, rebaseRepoPath);

        // create a local copy of the base repo as backup
        // duration should not be high, because the folder should only contain
        // checked in files
        fsExtra.copySync(rebaseRepoPath, rebaseRepoBackupPath);

        // get the origin url from the fromRepo just in case if a new remote must be set
        let upstreamRepoOriginUrl = new TextDecoder()
          .decode(
            execSync(`cd ${projectsPath}/${upstreamRepo} && git config --get remote.origin.url`)
          )
          .trim();

        // create a remote if necessary
        upstreamBranch = gitUtils.createRemoteAndFetch(
          rebaseRepoPath,
          rebaseRepo,
          upstreamRepo,
          upstreamBranch,
          upstreamRepoOriginUrl
        );

        // check out the branch
        gitUtils.cleanRepoAndCheckOutBranch(rebaseRepoPath, rebaseBranch);

        // try the rebase
        try {
          execSync(`cd ${rebaseRepoPath} && git rebase ${upstreamBranch}`);
          return Promise.resolve(true);
        } catch (e) {
          // rebase resulted in a conflict
          return Promise.resolve(false);
        }
      })

      // the rebase was successful -> no conflict detected
      .then((success) => {
        if (success) {
          res.json({
            rebaseCheck: {
              success: true,
              rebaseRepo: req.body.rebaseRepo,
              upstreamBranch: req.body.upstreamBranch,
              rebaseBranch: req.body.rebaseBranch,
              upstreamRepo: req.body.upstreamRepo,
            },
          });
        } else {
          return Git.Index.open(`${rebaseRepoPath}/.git/index`).then((index) => {
            // get conflict data
            const conflictDatas = gitUtils.getConflictData(index, rebaseRepoPath);

            // get information of all commits in the rebase,
            // whether they could have been rebased successfully, introduced the conflict
            // or were not analysed due to the previously introduced conflict
            let count = parseInt(
              fsExtra.readFileSync(`${rebaseRepoPath}/.git/rebase-apply/last`, 'utf-8').toString().trim()
            );

            let conflictingIndex = parseInt(
              fsExtra.readFileSync(`${rebaseRepoPath}/.git/rebase-apply/next`, 'utf-8').toString().trim()
            );

            Git.Repository.open(rebaseRepoPath).then((rebaseRepository) => {
              // get the head of the branch which was rebased and get its parents
              Git.Commit.lookup(rebaseRepository, headSha).then((commit) => {
                const eventEmitter = commit.history();
                eventEmitter.on('commit', (commit) => {
                  if (count > 0) {
                    // the conflictText which will be shown in the visualisation
                    let conflictText = 'no conflicts';
                    if (count === conflictingIndex) {
                      conflictText = 'conflicts (shown below)';
                    } else if (count > conflictingIndex) {
                      conflictText = 'not analysed due to previous conflict';
                    }

                    // add the commit to the commit list of the rebase
                    commitsOfRebase.unshift({
                      sha: commit.sha(),
                      author: commit.author().toString(false),
                      conflictText: conflictText,
                    });

                    // decrease the counter and check, if the current commit was the last one of the rebase
                    count = count - 1;
                  }
                });
                eventEmitter.on('end', () => {
                  // return all conflict data
                  res.json({
                    rebaseCheck: {
                      success: false,
                      rebaseRepo: req.body.rebaseRepo,
                      upstreamBranch: req.body.upstreamBranch,
                      rebaseBranch: req.body.rebaseBranch,
                      upstreamRepo: req.body.upstreamRepo,
                      conflictDatas: conflictDatas,
                      commitsOfRebase: commitsOfRebase,
                    },
                  });
                });
                eventEmitter.on('error', (error) => {
                  console.log(error);
                });
                eventEmitter.start();
              });
            });
          });
        }
      })
      // restore the previously created backup to revert the rebase
      .finally(() => {
        gitUtils.restoreBackup(rebaseRepoPath, rebaseRepoBackupPath);
      })
  );
};
