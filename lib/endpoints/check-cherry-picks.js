'use strict';

const log = require('debug')('srv');
const Repository = require('../git.js');
const gitUtils = require('../git-utils.js');
const Git = require('nodegit');
const Promise = require('bluebird');
const fsExtra = require('fs-extra');
const { execSync } = require('child_process');

module.exports = function (req, res) {
  const cherryPickCommitInfos = req.body.cherryPickCommitInfos; // information of the commits which should be cherry picked, must be sorted
  let otherRepo = req.body.otherRepo;
  const toRepo = req.body.toRepo; // repository which should be cherry picked into
  let toBranch = req.body.toBranch; // branch which should be cherry picked into

  let toRepository; // the repository into which should be cherry picked

  // get the default identity of the root repository
  const rootProject = gitUtils.getRootRepositoryID();

  // check if the toRepo is equal to the base project and
  // and if the toRepo is equal to the fromRepo
  // if the the toBranch is a remote one (origin)
  // only necessary for the base project, because of the local branches
  if (
    toRepo === rootProject &&
    // toRepo === cherryPickCommitInfo.fromRepo &&
    !toBranch.startsWith('origin/')
  ) {
    // yes: change remote to root
    toBranch = `root/${toBranch}`;
  }

  // get the path where all the cloned projects are located
  const projectsPath = gitUtils.getProjectsPath();

  // create the path of the baseProject
  const toRepoPath = `${projectsPath}/${toRepo}`;
  const toRepoBackupPath = `${toRepoPath}Backup`;

  let otherRepoOriginUrl;

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
      .then(() => Repository.fromPath(`${projectsPath}/${otherRepo}`))
      .then((fromRepository) => fromRepository.getOriginUrl())
      .then((_otherRepoOriginUrl) => (otherRepoOriginUrl = _otherRepoOriginUrl))
      // open the toRepo
      .then(() => Repository.fromPath(toRepoPath))
      // save the opened repository for a later use and create the remote
      .then((_toRepository) => {
        toRepository = _toRepository;
        gitUtils.createRemoteAndFetch(toRepository, toRepo, otherRepo, '', otherRepoOriginUrl)
      })
      // check out the branch
      .then(() => {
        return gitUtils.cleanRepoAndCheckOutBranch(toRepoPath, toBranch);
      })
      // merge fromBranch into toBranch
      .then(() => cherryPickCommits(cherryPickCommitInfos, toRepoPath, 0))
      .then((result) => {
        // the cherry picks were successful -> return the response
        if (result === 0) {
          res.json({
            cherryPickCheck: {
              success: true,
              toRepo: req.body.toRepo,
              toBranch: req.body.toBranch,
              cherryPickCommitInfos,
            },
          });
        } else {
          // one cherry pick resulted in a conflict -> get the conflict metadata and return them
          return Git.Index.open(`${toRepoPath}/.git/index`).then((index) => {
            // get the conflict metadata
            const conflictDatas = gitUtils.getConflictData(index, toRepoPath);

            // each commit info which has no conflictText were not analysed because of a previous conflict
            cherryPickCommitInfos.forEach((cherryPickCommitInfo) => {
              if (!cherryPickCommitInfo.conflictText) {
                cherryPickCommitInfo.conflictText = 'not analysed due to previous conflict';
              }
            });

            // return all conflict data
            res.json({
              cherryPickCheck: {
                success: false,
                toRepo: req.body.toRepo,
                toBranch: req.body.toBranch,
                conflictDatas: conflictDatas,
                cherryPickCommitInfos,
              },
            });
          });
        }
      })
      // restore the previously created backup to revert the rebase
      .finally(() => {
        gitUtils.restoreBackup(toRepoPath, toRepoBackupPath);
      })
  );
};

/**
 *  Cherry picks all commits from commitInfos.
 * @param commitInfos {[*]} the infos of the commits which should be cherry picked
 * @param toRepoPath {string} the path to the repository
 * @param index {number} a counter indicating which commit is currently cherry picked
 * @returns 0, if no conflict was detected; {index, commitInfos} if
 */
function cherryPickCommits(commitInfos, toRepoPath, index) {
  if (index < commitInfos.length) {
    const commitInfo = commitInfos[index];
    try {
      execSync(`cd ${toRepoPath} && git cherry-pick ${commitInfo.sha}`);
    } catch (ex) {
      // a conflict occurred
      return Promise.resolve({
        index: Git.Index.open(`${toRepoPath}/.git/index`),
        commitInfos: commitInfos,
      });
    }
    // no conflict occurred
    return cherryPickCommits(commitInfos, toRepoPath, index + 1);
  } else {
    return Promise.resolve(0);
  }
}
