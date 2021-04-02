'use strict';

const Git = require('nodegit');
const fs = require('fs');
const Promise = require('bluebird');
const Repository = require('./git.js');
const ctx = require('./context.js');
const config = require('./config.js');
const { execSync } = require('child_process');

module.exports = {
  /**
   * Clones a GitHub project if it does not exist.
   * Fetches changes if it already exists.
   * @param projectsProjectPath {string} path where the project should be cloned to/where the project lies
   * @param projectsUrl {string} the url/path of the repository
   * @param shouldCopyOriginUrl {boolean}
   * @returns {string} message if the project was cloned or fetched
   */
  fetchOrCloneRepo: function (projectsProjectPath, projectsUrl, shouldCopyOriginUrl = false) {
    // check if the project already exists
    if (fs.existsSync(projectsProjectPath)) {
      // yes: fetch changes
      execSync(`${projectsProjectPath} && git pull --all --prune`);
      return `Fetched repository ${projectsProjectPath}`;
    } else {
      // no: clone the repository
      execSync(`git clone ${projectsUrl} ${projectsProjectPath} --no-hardlinks`);
      if (shouldCopyOriginUrl) {
        // the origin url of the git repository
        let originUrl = new TextDecoder()
          .decode(execSync(`cd ${projectsUrl} && git config --get remote.origin.url`))
          .trim();

        // the path of the local base repository
        let rootRepoPath = new TextDecoder()
          .decode(execSync(`cd ${projectsProjectPath} && git config --get remote.origin.url`))
          .trim();

        // set origin to url of the git repository and set new remote root to local base repository to get access to local brances
        execSync(
          `cd ${projectsProjectPath} && git remote set-url origin ${originUrl} && git remote add root ${rootRepoPath} && git pull --all --prune`
        );
        return `Cloned repository ${projectsUrl} to ${projectsProjectPath}.`;
      }
    }
  },

  /**
   * Gets the owner and name of the root repository from the context and returns the identifier "<owner>/<name>".
   * @returns {string} the identifier of the root project
   */
  getRootRepositoryID() {
    const rootProjectName = ctx.repo.getName();
    const rootProjectOwner = ctx.repo.getOwner();
    return `${rootProjectOwner}/${rootProjectName}`;
  },

  /**
   * Gets the path from the context where all the cloned projects are located.
   * @returns {string} the path to the projects
   */
  getProjectsPath() {
    const projectsPath = config.get('projectsPath');
    if (!projectsPath) {
      // TODO: error handling
    }
    return projectsPath;
  },

  /**
   * Checks if the repoID is equal to thr rootProjectID and if the repo is already cloned (repoPath exists).
   * If not, clone the repo from the local rootProject.
   * @param rootProjectID {string} ID of the root project <owner>/<name>
   * @param repoID {string} ID (<owner>/<name>) of the repo which should be checked if a clone is necessary
   * @param repoPath {string} the path to the cloned project/where the project should be cloned
   * @returns {string} message if the project was cloned
   */
  cloneRootProjectFromLocal(rootProjectID, repoID, repoPath) {
    // check if the rebaseRepo is the root repo and if its already cloned
    // if it is already cloned, delete it and clone it again
    // if its not cloned -> clone it
    // this check is only necessary for the rootRepo, because all other repos
    // will be cloned when selecting them in the UI and run the project indexing
    if (repoID === rootProjectID) {
      if (fs.existsSync(repoPath)) {
        execSync(`rm -rf ${repoPath}`);
      }
      this.fetchOrCloneRepo(repoPath, ctx.targetPath, true);
    }
  },

  /**
   * Sets the remoteRepoID as a remote of the checkedOutRepoID and fetches from all repositories.
   * The remote will not be set, if the repos are the same and if the remote is was not set previously.
   * Returns a Promise containing the updated remoteBranch
   * which can be used for the git operation (e.g. merge, rebase or cherry pick).
   * @param checkedOutRepo {string} the path to the repository of the checked out branch
   * @param checkedOutRepoID {string} the repository ID of the checked out branch
   * @param remoteRepoID {string} the repository ID of the remote
   * @param remoteRepoBranch {string} the branch of the remote (only needed to create the actual branch name which is known by the repository after the remote setup
   * @param remoteRepoOriginUrl {string} the origin url of the remote
   * @returns {string}
   */
  createRemoteAndFetch(
    checkedOutRepo,
    checkedOutRepoID,
    remoteRepoID,
    remoteRepoBranch,
    remoteRepoOriginUrl
  ) {
    // if the checkedOutRepoID is different than the remoteRepoID, get all remotes
    // to check if the remote is already set
    // otherwise, no remote has to be set because the following git operation
    // (e.g. merge, rebase) will be performed with two local branches of the same repository
    if (checkedOutRepoID === remoteRepoID) {
      remoteRepoID = ''; // the remoteRepoID is set to '', because the branch is a local one and can be found without a remote prefix
    } else {
      // if the remote branch is a local one (can be the case if the remote is the root repository)
      // then remove the origin identifier, because it will be replaced by the remote ID
      remoteRepoBranch = !remoteRepoBranch.startsWith('origin/')
        ? `${remoteRepoID}/${remoteRepoBranch}`
        : `${remoteRepoID}/${remoteRepoBranch.replace('origin/', '')}`;
    }

    // if the remote is not set in the checkedOutRepo (statement in try throws error)
    // -> create the remote
    try {
      execSync(`cd ${checkedOutRepo} && git ls-remote ${remoteRepoID}`);
    } catch (e) {
      execSync(`cd ${checkedOutRepo} && git remote add ${remoteRepoID} ${remoteRepoOriginUrl}`);
    }

    // pull from all remotes
    execSync(`cd ${checkedOutRepo} && git pull --all --prune`);

    return remoteRepoBranch;
  },

  /**
   * Removes all modifications in the working directory and checks out the branch.
   * @param repoPath {string} path to the repository
   * @param branch {string} branch which should be checked out
   * @returns {void}
   */
  cleanRepoAndCheckOutBranch(repoPath, branch) {
    // remove all possible remaining changes, is not problematic because these repos should be only used
    // internally as safety copy, such that no unintentional changes will be done in the root repository
    // and no user should work in these
    execSync(`cd ${repoPath} && git reset -q --hard HEAD && git clean -fdxq`);

    // check out the branch which should be merged into
    try {
      execSync(`cd ${repoPath} && git checkout ${branch} -q`);
    } catch (ex) {
      // branch already checked out -> ignore
    }

    // remove all possible remaining changes, is not problematic because these repos should be only used
    // internally as safety copy, such that no unintentional changes will be done in the root repository
    // and no user should work in these
    execSync(`cd ${repoPath} && git reset -q --hard HEAD && git clean -fdxq`);
  },

  /**
   * Returns the metadata of conflicts of an index.
   * The files of the repository must contain the conflicts (<<<<<<< [...] ======= [...] >>>>>>>).
   * The metadata contain:
   * <ul>
   *   <li>relative file path of the conflicting file</li>
   *  <li>an array with line and position of the starting points of the our section</li>
   *  <li>an array with line and position of the ending points of the our section</li>
   *  <li>an array with line and position of the starting points of the their section</li>
   *  <li>an array with line and position of the ending points of the their section</li>
   *  <li>the whole file content containing the conflicts</li>
   * </ul>
   * @param index {Git.Index} the index containing the possible conflicts
   * @param repoPath {string} the path to the repository which contains the updated files
   * @returns {[]} the metadata of the conflicts, or [], if no conflicts exist
   */
  getConflictData(index, repoPath) {
    const conflictDatas = [];
    // check each file for conflicts and collect the conflict data
    index.entries().forEach((indexEntry) => {
      // the file contains conflicts
      if (Git.Index.entryIsConflict(indexEntry)) {
        // the conflicting data of the file was not collected until now
        if (
          conflictDatas.filter((conflictData) => conflictData.path === indexEntry.path).length === 0
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
          const fileContent = fs.readFileSync(`${repoPath}/${indexEntry.path}`).toString('UTF-8');

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
      }
    });

    return conflictDatas;
  },

  /**
   * Restores the repoBackup by deleting the repoPath and renaming the folder in repoBackupPath to repoPath.
   * @param repoPath {string} path of the repository folder which should be restored from the backup
   * @param repoBackupPath {string} the path of the repository backup
   */
  restoreBackup(repoPath, repoBackupPath) {
    // delete the baseRepo folder in order to restore the backup
    fs.rmdirSync(repoPath, { recursive: true });

    // restore backup folder by renaming baseRepoBackup folder to baseRepo folder
    fs.renameSync(repoBackupPath, repoPath);
  },
};
