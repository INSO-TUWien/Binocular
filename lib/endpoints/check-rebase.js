'use strict';

const log = require('debug')('srv');
const config = require('../config.js');
const ctx = require('../context.js');
const Repository = require('../git.js');
const gitUtils = require('../git-utils.js');
const Git = require('nodegit');
const Promise = require('bluebird');
const fs = require('fs');
const fsExtra = require('fs-extra');

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
  const rootProjectName = ctx.repo.getName();
  const rootProjectOwner = ctx.repo.getOwner();
  const rootProject = `${rootProjectOwner}/${rootProjectName}`;

  // check if the upstreamRepo is equal to the base project and
  // if the the upstreamBranch is a remote one (origin)
  if (upstreamRepo === rootProject && !upstreamBranch.startsWith('origin/')) {
    // yes: change remote to root
    upstreamBranch = `root/${upstreamBranch}`;
  }

  // get the path where all the cloned projects are located
  const projectsPath = config.get('projectsPath');
  if (!projectsPath) {
    // TODO: error handling
  }

  // create the path of the baseProject
  const rebaseRepoPath = `${projectsPath}/${rebaseRepo}`;
  let rebaseRepoBackupPath;

  // check if the rebaseRepo is the root repo and if its already cloned
  // if its not cloned -> clone it
  // this check is only necessary for the rootRepo, because all other repos
  // will be cloned when selecting them in the UI and run the project indexing
  let baseRepoPromise = Promise.resolve();
  if (rebaseRepo === rootProject && !fs.existsSync(rebaseRepoPath)) {
    const cloneOptionsBaseProject = new Git.CloneOptions();
    cloneOptionsBaseProject.local = Git.Clone.LOCAL.LOCAL;
    baseRepoPromise = gitUtils.fetchOrCloneRepo(
      rebaseRepoPath,
      ctx.targetPath,
      cloneOptionsBaseProject,
      true
    );
  }

  baseRepoPromise
    // create a local copy of the base repo as backup
    // duration should not be high, because the folder should only contain
    // checked in files
    .then(() => {
      rebaseRepoBackupPath = `${rebaseRepoPath}Backup`;
      return fsExtra.copy(rebaseRepoPath, rebaseRepoBackupPath);
    })
    // open the rebaseRepo
    .then(() => Repository.fromPath(rebaseRepoPath))
    // checkout the rebaseBranch
    .then((repo) => {
      baseRepository = repo;
      return repo.repo.checkoutBranch(rebaseBranch);
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
        return Git.Remote.create(
          baseRepository.repo,
          upstreamRepo,
          `${projectsPath}/${upstreamRepo}`
        );
      }
      return Promise.resolve();
    })
    // rebase the branches
    .then(() => {
      return baseRepository.repo.rebaseBranches(
        rebaseBranch,
        upstreamRepo ? `${upstreamRepo}/${upstreamBranch}` : upstreamBranch,
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
        // array for the conflict data of each conflicting file
        const conflictDatas = [];

        // check each file for conflicts and collect the conflict data
        index.entries().forEach((indexEntry) => {
          // the file contains conflicts
          if (Git.Index.entryIsConflict(indexEntry)) {
            // the conflicting data was not collected until now
            if (
              conflictDatas.filter((conflictData) => conflictData.path === indexEntry.path)
                .length === 0
            ) {
              // starting points of conflicting sections (ours)
              const colorOursBegins = [];
              // end points of conflicting sections (ours)
              const colorOursEnds = [];
              // starting points of conflicting sections (theirs)
              const colorTheirsBegins = [];
              // starting points of conflicting sections (theirs)
              const colorTheirsEnds = [];
              // the complete content of the file (incl. conflicting sections)
              const fileContent = fs
                .readFileSync(`${rebaseRepoPath}/${indexEntry.path}`)
                .toString('UTF-8');

              let lineCount = 0;
              let fileContentLines = fileContent.split('\n');
              fileContentLines.forEach((line) => {
                // the current line marks the starting point of the ours section of a conflict
                if (line.startsWith('<<<<<<<')) {
                  colorOursBegins.push({ line: lineCount, ch: 0 });
                } else if (line.startsWith('=======')) {
                  // the current line marks the end point of the ours section of a conflict
                  // and the starting point of the theirs section of a conflict
                  colorOursEnds.push({ line: lineCount, ch: 0 });
                  colorTheirsBegins.push({ line: lineCount + 1, ch: 0 });
                } else if (line.startsWith('>>>>>>>')) {
                  // the current line marks the end point of the theirs section of a conflict
                  colorTheirsEnds.push({ line: lineCount, ch: line.length });
                }

                lineCount++;
              });

              // add the conflict data in the array
              conflictDatas.push({
                path: indexEntry.path,
                colorOursBegins,
                colorOursEnds,
                colorTheirsBegins,
                colorTheirsEnds,
                fileContent,
              });
            }

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
          }
        });

        // get information of all commits in the rebase,
        // whether they could have been rebased successfully, introduced the conflict
        // or were not analysed due to the previously introduced conflict
        let count = 0;

        // get the head of the branch which was rebased and get its parents
        Git.Commit.lookup(baseRepository.repo, headSha).then((commit) => {
          const eventEmitter = commit.history();
          eventEmitter.on('commit', (commit) => {
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
            if (count === rebaseOperationCountTotal) {
              eventEmitter.emit('end');
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
      // delete the baseRepo folder in order to restore the backup
      fs.rmdirSync(rebaseRepoPath, { recursive: true });

      // restore backup folder by renaming baseRepoBackup folder to baseRepo folder
      fs.renameSync(rebaseRepoBackupPath, rebaseRepoPath);
    });
};
