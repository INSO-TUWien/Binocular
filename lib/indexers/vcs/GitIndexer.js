'use strict';

import debug from 'debug';

const serve = debug('idx:vcs:git');
const log = debug('log:idx:vcs:git');
import _ from 'lodash';
import Commit from '../../models/Commit.js';
import Module from '../../models/Module.js';
import File from '../../models/File.js';
import Branch from '../../models/Branch.js';
import BranchFileConnection from '../../models/BranchFileConnection.js';
import CommitFileConnection from '../../models/CommitFileConnection.js';
import CommitFileStakeholderConnection from '../../models/CommitFileStakeholderConnection.js';
import BranchFileFileConnection from '../../models/BranchFileFileConnection.js';
import Stakeholder from '../../models/Stakeholder.js';
//get the names of the branches from the .binocularrc file for which fiule renames should be tracked
import { fixUTF8 } from '../../utils';
let fileRenameBranches;

class GitIndexer {
  constructor(repo, urlProvider, reporter, config, context) {
    fileRenameBranches = config.get().fileRenameBranches || [];
    this.repo = repo;
    this.stopping = false;
    this.urlProvider = urlProvider;
    this.reporter = reporter;
    this.context = context;
  }

  setGateway(gatewayService) {
    this.gateway = gatewayService;
  }

  /**
   * reset all counters for a new indexing process
   */
  resetCounter() {
    this.counter = {
      commits: {
        total: 0,
        omitCount: 0,
        persistCount: 0,
      },
      files: {
        total: 0,
        omitCount: 0,
        persistCount: 0,
        cache: new Set(),
      },
      modules: {
        total: 0,
        omitCount: 0,
        persistCount: 0,
        cache: new Set(),
      },
      langFile: {
        total: 0,
        omitCount: 0,
        persistCount: 0,
      },
    };
  }

  /**
   * start local repo indexing and processing all existing commits
   *
   * @returns {Promise<void>}
   */
  async index() {
    this.process = (async () => {
      this.stopping = false;

      log('Counting commits...');
      this.resetCounter();
      const commits = await this.repo.listAllCommitsRemote();
      this.counter.commits.total = commits.length;
      //await this.repo.walk(() => this.counter.commits.total++);
      if ('setCommitCount' in this.reporter && typeof this.reporter.setCommitCount === 'function') {
        this.reporter.setCommitCount(this.counter.commits.total);
      }

      const currentBranch = await this.repo.getCurrentBranch();
      const branches = await this.repo.getAllBranchesRemote();

      for (const i in branches) {
        if (branches[i] !== 'HEAD') {
          const latestCommit = await this.repo.getLatestCommitForBranchRemote(branches[i]);
          //check if the name of this branch includes any of the names in the fileRenameBranches list of the .binocularrc file
          //doing it like this allows us to put "feature" in the rc file
          //  and track branches like "origin/feature/1", "origin/feature/2" etc.
          const tracksFileRenames = fileRenameBranches.filter((b) => branches[i].includes(b)).length !== 0;
          const branch = {
            branchName: branches[i],
            id: i,
            currentActive: branches[i] === currentBranch,
            latestCommit: latestCommit[0].oid,
            tracksFileRenames: tracksFileRenames,
          };
          Branch.persist(branch);
        }
      }
      log('Processing', this.counter.commits.total, 'commits');

      //persist commits
      //also creates (and connects) stakeholder objects from commit signature
      for (const commit of commits) {
        await processCommit
          .bind(this)(commit, currentBranch)
          .catch({ stop: true }, () => null);
      }

      //create branch-file connections
      //in the process, check which files have been renamed and store these in the branch-file-file connection
      await createBranchFileConnections(this.repo, this.context);

      //create commit-file-stakeholder connections to model ownership of files
      //models the following: at the time of commit c, stakeholder s owns x lines of file f
      await createOwnershipConnections(this.repo, this.context);

      this.printStats();

      // clear cache
      this.counter.files.cache.clear();

      if (this.stopping) {
        return;
      }

      log('Deducing file lengths...');
      await File.deduceMaxLengths();
      log('Done');
    })();
    return this.process;
  }

  /**
   *  stop actual indexing process
   */
  async stop() {
    log('Stopping');
    this.stopping = true;
    await this.process;
  }

  isStopping() {
    return this.stopping;
  }

  /**
   * debug print statistic of processed data
   */
  printStats() {
    if (this.counter.commits.persistCount > 0 || !this.stopping) {
      log('Persisted %d new commits (%d already present)', this.counter.commits.persistCount, this.counter.commits.omitCount);
    }
    if (this.counter.files.persistCount > 0 || !this.stopping) {
      log('Persisted %d new files (%d already present)', this.counter.files.persistCount, this.counter.files.omitCount);
    }
    if (this.counter.modules.persistCount > 0 || !this.stopping) {
      log('Persisted %d new modules (%d already present)', this.counter.modules.persistCount, this.counter.modules.omitCount);
    }
  }
}

export default GitIndexer;

/**
 * process the given commit
 *
 * @param commit contains the current commit that should be processed
 * @param currentBranch current selected local branch
 * @returns {Promise<void>}
 */
async function processCommit(commit, currentBranch) {
  if (this.stopping) {
    // needed to cancel walking
    throw { stop: true };
  }
  if ((await Commit.findById(commit.oid)) !== null) {
    this.reporter.finishCommit();
    return;
  }
  // get or create commit
  const commitDAO = await Commit.persist(this.repo, commit, this.urlProvider);
  if (!commitDAO) {
    return;
  }
  if (commitDAO.justCreated) {
    this.counter.commits.persistCount++;
  } else {
    this.counter.commits.omitCount++;
  }

  if ('finishCommit' in this.reporter && typeof this.reporter.finishCommit === 'function') {
    this.reporter.finishCommit();
  }

  serve(`${this.counter.commits.omitCount + this.counter.commits.persistCount}/${this.counter.commits.total} commits processed`);
  // create new connections
  const connections = await commitDAO.processTree(this.repo, commit, currentBranch, this.urlProvider, this.gateway, this.context);

  return postProcessing.bind(this)(
    commitDAO,
    (connections || []).filter((exist) => exist)
  );
}

/**
 * show connection statistic and create/update various commit related connection
 *
 * @param commit contains the current commit DAO
 * @param connections holds an array of all created connections and objects that refers th the current commit
 */
async function postProcessing(commit, connections) {
  if (!connections || connections.length < 1) {
    return;
  }

  const resolvedConnections = await Promise.all(connections);

  const files = _.uniqBy(
    resolvedConnections
      .filter((connection) => connection && connection.file)
      .reduce((reduction, connection) => {
        return reduction.concat(connection.file);
      }, []),
    (file) => file._id
  );

  const newFiles = files.filter((file) => file.justCreated);

  handleReporting.bind(this, 'File')(files, newFiles);

  // create new module connections
  await moduleCreationAndLinking.bind(this)(commit, resolvedConnections, files, newFiles);
}

/**
 * add connection for new modules
 *
 * @param commit contains the current commit DAO
 * @param connections contains all connections and processed data
 * @param files contains all files related to this commit
 * @param newFiles contains all files that has been created recently
 * @returns {Promise<void>}
 */
async function moduleCreationAndLinking(commit, connections, files, newFiles) {
  const modules = await Promise.all(
    _.uniq(files.reduce((reduction, file) => reduction.concat(file.getModules()), [])).map((path) => Module.persist({ path }))
  );
  const newModules = modules.filter((module) => module.justCreated);

  // connect modules with its parents
  newModules.forEach((module) => {
    const fragments = module.data.path.split('/');
    fragments.pop();
    const parentPath = fragments.join('/');
    if (parentPath.length < 1) {
      return;
    }

    const parent = modules.find((module) => module.data.path === parentPath);
    if (parent) {
      parent.connect(module);
    }
  });

  // connect files to modules
  newFiles.forEach((file) => {
    const dir = file.dir();
    const module = modules.find((module) => module.data.path === dir);
    if (module) {
      module.connect(file);
    }
  });

  if (newFiles.length > 0) {
    // create module commit connection with stats and webUrl
    await Promise.all(
      modules.map(async (module) => {
        // update all connections according to the change of the new stats if the file belongs to this module or a submodule
        if (!newFiles.find((file) => file.dir().startsWith(module.data.path))) {
          return;
        }

        const stats =
          connections
            .filter((connection) => connection && connection.stats && connection.file.dir().startsWith(module.data.path))
            .reduce(
              (stats, item) => {
                stats.additions += item.stats.additions;
                stats.deletions += item.stats.deletions;
                return stats;
              },
              { additions: 0, deletions: 0 }
            ) || {};
        return commit.storeConnection(module, {
          stats,
          webUrl: this.urlProvider.getDirUrl(commit.data.sha, module.data.path),
        });
      })
    );
  }

  handleReporting.bind(this, 'Module')(modules, newModules);
}

/**
 * change statistic and print and send current progress of a specific attribute
 *
 * @param key contains the singular of the attribute that should be reported
 * @param list contains all items that has been processed recently and should be reported
 * @param newItems contains all newly created items that has been processed recently
 */
function handleReporting(key, list, newItems) {
  const lKey = key ? key.toLowerCase() : '';

  // getting simple plural form
  const counterName = `${lKey}s`;
  if (!(counterName in this.counter)) {
    return;
  }

  const emitCount = adjustStatistic.bind(this)(key, list, newItems);

  // concatenating and transforming key to match reporting function
  const finishKey = 'finish' + key;
  for (let index = 0; index < emitCount; index++) {
    if (finishKey in this.reporter && typeof this.reporter[finishKey] === 'function') {
      this.reporter[finishKey]();
    }
  }
}

/**
 * adjust statistic of counter entries that uses a cache
 *
 * @param key name of the counter attribute which is related tot the list elements
 * @param list contains the list of all processed data that belongs to the given attribute
 * @param newElements contains all new elements that has recently been created
 *
 * @returns {number} number of elements that does not already exist in the cache list
 */
function adjustStatistic(key, list, newElements) {
  const lKey = key ? key.toLowerCase() : '';

  // getting simple plural form
  const counterName = `${lKey}s`;

  if (!list || list.length < 0 || !newElements || !this.counter[counterName]) {
    return 0;
  }

  list.forEach((item) => {
    this.counter[counterName].cache.add(item._id);
  });

  this.counter[counterName].persistCount += newElements.length;
  this.counter[counterName].total = this.counter[counterName].cache.size;
  this.reporter['set' + key + 'Count'](this.counter[counterName].cache.size);
  const emitCount = this.counter[counterName].cache.size - this.counter[counterName].persistCount - this.counter[counterName].omitCount;
  this.counter[counterName].omitCount = this.counter[counterName].cache.size - this.counter[counterName].persistCount;
  if (newElements.length > 0) {
    serve(`${newElements.length}/${this.counter[counterName].total} ${counterName} in current commit processed`);
  }
  return emitCount;
}

async function createBranchFileConnections(repo, context) {
  //find all branch file connections so we can skip them
  const existingBranchFileConnections = await BranchFileConnection.findAll();
  const existingBranchFileFileConnections = await BranchFileFileConnection.findAll();
  const branchesDAO = await Branch.findAll();
  const filesDAO = await File.findAll();
  //for every branch in the DB
  for (const branch of branchesDAO) {
    const name = branch.data.branch;
    let filePathsForBranch;
    try {
      filePathsForBranch = await repo.getFilePathsForBranchRemote(name);
    } catch (e) {
      //can happen when branches are deleted and program is started with a database that includes the deleted branch
      // in this case, remove this branch and all connections from the database
      if (e.code === 'NotFoundError') {
        // get all branch-file connections of this branch
        const branchFileConns = existingBranchFileConnections.filter((bfc) => bfc._to === branch._id);
        // for each of these connections, get the associated branch-file-file connections
        for (const bfc of branchFileConns) {
          const branchFileFileConns = existingBranchFileFileConnections.filter((bffc) => bffc._from === bfc._id);
          for (const bffc of branchFileFileConns) {
            // remove branch-file-file connection
            await BranchFileFileConnection.remove(bffc);
          }
          // remove branch-file-conection
          await BranchFileConnection.remove(bfc);
        }
        // remove the branch
        await Branch.remove(branch);
      }

      // nothing else to do for this branch. Continue to the next one.
      continue;
    }
    //use Promise.all for parallelization
    await Promise.all(
      //for every file on this branch
      filesDAO.map(async (file) => {
        if (filePathsForBranch.includes(file.data.path)) {
          //if this connection already exists, skip
          if (existingBranchFileConnections.filter((bfc) => bfc._from === file._id && bfc._to === branch._id).length !== 0) {
            return;
          }
          //connect file to branch
          if (!branch.data.tracksFileRenames) return branch.ensureConnection(file);
          return branch.ensureConnection(file).then(async (branchFile) => {
            //get previous filenames if applicable
            return repo.getPreviousFilenames(name, file.data.path, context).then(async (previousFilenames) => {
              if (previousFilenames.length !== 0) {
                //if there are previous filenames, we create a new connection

                //sort the list by date descending
                const prevFilenamesList = previousFilenames.sort((a, b) => b.date - a.date);

                let currentDate = null;
                for (const prevFileObj of prevFilenamesList) {
                  const prevFilename = prevFileObj.fileName;
                  const hasThisNameUntil = currentDate;
                  const hasThisNameFrom = prevFileObj.timestamp;
                  currentDate = prevFileObj.timestamp;
                  const fileObj = filesDAO.filter((f) => f.data.path === prevFilename)[0];
                  //connect the new connection to relevant files
                  //this models file renames (file on this branch was called ... earlier)
                  BranchFileFileConnection.ensure(
                    { hasThisNameFrom: hasThisNameFrom, hasThisNameUntil: hasThisNameUntil },
                    { from: branchFile, to: fileObj }
                  );
                }
              }
            });
          });
        }
      })
    );
  }
}

async function createOwnershipConnections(repo, context) {
  const commitObjects = await Commit.findAll();
  const fileObjects = await File.findAll();
  const stakeholderObjects = await Stakeholder.findAll();
  const stakeholderIds = {};
  for (const s of stakeholderObjects) {
    stakeholderIds[s.data.gitSignature] = s;
  }

  //get existing connections to skip commits that were already connected
  const existingCommitFileStakeholderConnections = _.uniq((await CommitFileStakeholderConnection.findAll()).map((c) => c._from));
  let commitFileConnections = await CommitFileConnection.findAll();
  //we are not interested in connections that have already been processed
  commitFileConnections = commitFileConnections.filter((cfc) => !existingCommitFileStakeholderConnections.includes(cfc._id));
  //filter connections that represent a file deletion
  commitFileConnections = commitFileConnections.filter((cfc) => cfc.data.action !== 'deleted');
  //also filter connections where files have been renamed without changes
  commitFileConnections = commitFileConnections.filter(
    (cfc) => !(cfc.data.action === 'added' && cfc.data.stats.additions === 0 && cfc.data.stats.deletions === 0)
  );
  const commitFileConnectionsGrouped = Object.entries(_.groupBy(commitFileConnections, (cfc) => cfc._to));

  for (const [commitId, cfcGroup] of commitFileConnectionsGrouped) {
    const commitObject = commitObjects.filter((c) => c._id === commitId)[0];
    const sha = commitObject.sha;

    await Promise.all(
      cfcGroup.map(async (cfc) => {
        //if this connection tells us that the file has been deleted in this commit, we can ignore this connection
        if (cfc.data.action === 'deleted') {
          return;
        }
        const fileObject = fileObjects.filter((f) => f._id === cfc._from)[0];
        const file = fileObject.path;
        try {
          const res = await repo.getOwnershipForFile(file, sha, context);
          for (const [stakeholder] of Object.entries(res.ownershipData)) {
            CommitFileStakeholderConnection.ensure(
              { ownedLines: res.ownershipData[stakeholder], hunks: res.hunks[stakeholder] },
              { from: cfc, to: stakeholderIds[fixUTF8(stakeholder)] }
            );
          }
        } catch (e) {
          console.log(`Cant get ownership for ${file} at commit ${cfc._to}`);
        }
      })
    );
  }
}
