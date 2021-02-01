'use strict';

const Git = require('nodegit');
const fs = require('fs');
const Promise = require('bluebird');
const Repository = require('./git.js');
const ctx = require('./context.js');
const config = require('./config.js');

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
   * @returns {Promise<string|void>} Promise with a message if the project was cloned, otherwise an empty Promise
   */
  cloneRootProjectFromLocal(rootProjectID, repoID, repoPath) {
    // check if the rebaseRepo is the root repo and if its already cloned
    // if its not cloned -> clone it
    // this check is only necessary for the rootRepo, because all other repos
    // will be cloned when selecting them in the UI and run the project indexing
    let repoPromise = Promise.resolve();
    if (repoID === rootProjectID && !fs.existsSync(repoPath)) {
      const cloneOptionsBaseProject = new Git.CloneOptions();
      cloneOptionsBaseProject.local = Git.Clone.LOCAL.LOCAL;
      repoPromise = this.fetchOrCloneRepo(
        repoPath,
        ctx.targetPath,
        cloneOptionsBaseProject,
        true
      );
    }
    return repoPromise;
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
  }
};
