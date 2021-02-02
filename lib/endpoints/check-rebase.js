'use strict';

const log = require('debug')('srv');
const Repository = require('../git.js');
const gitUtils = require('../git-utils.js');
const Git = require('nodegit');
const Promise = require('bluebird');
const fsExtra = require('fs-extra');
const { execSync } = require('child_process');

module.exports = function (req, res) {
  const headSha = req.body.headSha; // the sha rebaseRepo's the head commit
  const rebaseRepo = req.body.rebaseRepo; // repository of the branch to rebase
  const rebaseBranch = req.body.rebaseBranch; // branch which should be rebased onto another one
  let upstreamRepo = req.body.upstreamRepo; // repository which should be rebased on
  let upstreamBranch = req.body.upstreamBranch; // branch which should be rebased on

  let commitsOfRebase = []; // array which holds information about all commits of the rebase and if they were rebased successfully, introduced a conflict or were not analysed due to a previous conflict
  let rebaseCommitCount = -1; // a counter indicating on which commit the rebase is currently at, init value is -1 because the rebase callback function is called before the first rebase step
  let rebaseOperationCountTotal; // number of rebase operations in total
  let baseRepository; // the repository from which the branch should be rebased

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

  let upstreamRepoOriginUrl;

  return (
    // check if the rebaseRepo is the root repo and if its already cloned
    // if its not cloned -> clone it
    // this check is only necessary for the rootRepo, because all other repos
    // will be cloned when selecting them in the UI and run the project indexing
    gitUtils
      .cloneRootProjectFromLocal(rootProject, rebaseRepo, rebaseRepoPath)
      // create a local copy of the base repo as backup
      // duration should not be high, because the folder should only contain
      // checked in files
      .then(() => {
        return fsExtra.copy(rebaseRepoPath, rebaseRepoBackupPath);
      })
      // get the origin url from the upstreamRepo just in case if a new remote must be set
      .then(() => Repository.fromPath(`${projectsPath}/${upstreamRepo}`))
      .then((upstreamRepository) => upstreamRepository.getOriginUrl())
      .then((_upstreamRepoOriginUrl) => (upstreamRepoOriginUrl = _upstreamRepoOriginUrl))

      // open the rebaseRepo
      .then(() => Repository.fromPath(rebaseRepoPath))
      // checkout the rebaseBranch
      .then((repo) => {
        baseRepository = repo;
        // remove all possible remaining changes, is not problematic because these repos should be only used
        // internally as safety copy, such that no unintentional changes will be done in the root repository
        // and no user should work in these
        execSync(`cd ${rebaseRepoPath} && git reset -q --hard HEAD && git clean -fdxq`);

        // check out the branch which should be merged into
        try {
          execSync(`cd ${rebaseRepoPath} && git checkout ${rebaseBranch} -q`);
        } catch (ex) {
          // branch already checked out -> ignore
        }

        // remove all possible remaining changes, is not problematic because these repos should be only used
        // internally as safety copy, such that no unintentional changes will be done in the root repository
        // and no user should work in these
        execSync(`cd ${rebaseRepoPath} && git reset -q --hard HEAD && git clean -fdxq`);
        return Promise.resolve();
      })
      // if the rebaseRepo is different than the upstream repo, get all remotes
      // to check if the remote is already set
      .then(() => {
        if (rebaseRepo === upstreamRepo) {
          upstreamRepo = '';
          return Promise.resolve();
        }
        return Git.Remote.list(baseRepository.repo);
      })
      // if the remote should be checked and
      // and if the remote is not set in the baseRepo
      // -> create the remote
      .then((remoteNames) => {
        if (remoteNames && !remoteNames.includes(upstreamRepo)) {
          upstreamBranch = !upstreamBranch.startsWith('origin/')
            ? `${upstreamRepo}/${upstreamBranch}`
            : `${upstreamRepo}/${upstreamBranch.replace('origin/', '')}`;
          return Git.Remote.create(baseRepository.repo, upstreamRepo, upstreamRepoOriginUrl);
        }
        return Promise.resolve();
      })
      // fetch from all remotes
      .then(() =>
        baseRepository.repo.fetchAll({
          prune: Git.Fetch.PRUNE.GIT_FETCH_PRUNE,
        })
      )
      // rebase the branches
      .then(() => {
        return baseRepository.repo.rebaseBranches(
          rebaseBranch,
          upstreamBranch,
          null,
          null,
          (rebase) => {
            // get the total number of commits which are included in the rebase
            if (!rebaseOperationCountTotal) {
              rebaseOperationCountTotal = rebase.operationEntrycount();
            }
            // increase the counter in order to check later, on which commit a possible conflict occurred
            // the counter will stop, if a conflict occurred
            rebaseCommitCount = rebaseCommitCount + 1;
          }
        );
      })
      // the rebase was successful -> no conflict detected
      .then((result) => {
        if (result instanceof Git.Commit) {
          res.json({
            rebaseCheck: {
              success: true,
              rebaseRepo: req.body.rebaseRepo,
              upstreamBranch: req.body.upstreamBranch,
              rebaseBranch: req.body.rebaseBranch,
              upstreamRepo: req.body.upstreamRepo,
            },
          });
        }
      })
      // the rebase was not successful -> conflicts detected
      // or another error occurred
      .catch((index) => {
        if (index instanceof Git.Index) {
          // get conflict data
          const conflictDatas = gitUtils.getConflictData(index, rebaseRepoPath);

          // get information of all commits in the rebase,
          // whether they could have been rebased successfully, introduced the conflict
          // or were not analysed due to the previously introduced conflict
          let count = 0;

          // get the head of the branch which was rebased and get its parents
          Git.Commit.lookup(baseRepository.repo, headSha).then((commit) => {
            const eventEmitter = commit.history();
            eventEmitter.on('commit', (commit) => {
              if (count < rebaseOperationCountTotal) {
                // the conflictText which will be shown in the visualisation
                let conflictText = 'no conflicts';
                if (count === rebaseCommitCount) {
                  conflictText = 'conflicts (shown below)';
                } else if (count > rebaseCommitCount) {
                  conflictText = 'not analysed due to previous conflict';
                }

                // add the commit to the commit list of the rebase
                commitsOfRebase.push({
                  sha: commit.sha(),
                  conflictText: conflictText,
                });

                // increase the counter and check, if the current commit was the last one of the rebase
                count = count + 1;
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
        } else {
          console.log(index);
        }
      })
      // restore the previously created backup to revert the rebase
      .finally(() => {
        gitUtils.restoreBackup(rebaseRepoPath, rebaseRepoBackupPath);
      })
  );

  // index.conflictGet(indexEntry.path).then(iwas => {
  //   const { our_out, their_out } = iwas;
  //
  //   Git.Blob.lookup(baseRepository.repo, ancestor_out.id).then((blob) => {
  //     console.log('Blob');
  //     // console.log(blob.toString());
  //   });
  //   Git.Status.file(baseRepository.repo, indexEntry.path).then(number => {
  //     console.log(number);
  //   })
  //   console.log();
  // })
};
