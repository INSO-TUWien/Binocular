'use strict';

const debug = require('debug');
const serve = debug('idx:vcs:git');
const log = debug('log:idx:vcs:git');
const _ = require('lodash');
const Commit = require('../../models/Commit.js');
const Module = require('../../models/Module');
const File = require('../../models/File.js');
const Branch = require('../../models/Branch.js');

class GitIndexer {
  constructor(repo, urlProvider, reporter) {
    this.repo = repo;
    this.stopping = false;
    this.urlProvider = urlProvider;
    this.reporter = reporter;
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
      languages: {
        total: 0,
        omitCount: 0,
        persistCount: 0,
        cache: new Set(),
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
      const commits = await this.repo.listAllCommits();
      this.counter.commits.total = commits.length;
      //await this.repo.walk(() => this.counter.commits.total++);
      if ('setCommitCount' in this.reporter && typeof this.reporter.setCommitCount === 'function') {
        this.reporter.setCommitCount(this.counter.commits.total);
      }

      if ('setLanguageCount' in this.reporter && typeof this.reporter.setLanguageCount === 'function') {
        this.reporter.setLanguageCount(this.counter.languages.total);
      }

      if ('setFilesLanguageCount' in this.reporter && typeof this.reporter.setFilesLanguageCount === 'function') {
        this.reporter.setFilesLanguageCount(this.counter.langFile.total);
      }

      const currentBranch = await this.repo.getCurrentBranch();
      const branches = await this.repo.getAllBranches();

      for (const i in branches) {
        if (branches[i] !== 'HEAD') {
          const latestCommit = await this.repo.getLatestCommitForBranch(branches[i]);
          const branch = {
            branchName: branches[i],
            id: i,
            currentActive: branches[i] === currentBranch,
            latestCommit: latestCommit[0].oid,
          };
          Branch.persist(branch);
        }
      }
      log('Processing', this.counter.commits.total, 'commits');

      for (const commit of commits) {
        await processCommit
          .bind(this)(commit, currentBranch)
          .catch({ stop: true }, () => null);
      }

      //create branch-file connections
      Branch.findAll().then((branchesDAO) => {
        File.findAll().then((filesDAO) => {
          //for each branch object
          branchesDAO.map((branch) => {
            const name = branch.data.branch;
            //get all file paths for that branch
            this.repo.getFilePathsForBranch(name).then((filePathsForBranch) => {
              //for all file objects in the db
              filesDAO.map((file) => {
                if (filePathsForBranch.includes(file.data.path)) {
                  branch.ensureConnection(file);
                }
              });
            });
          });
        });
      });

      this.printStats();

      // clear cache
      this.counter.languages.cache.clear();
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
    if (this.counter.languages.persistCount > 0 || !this.stopping) {
      log('Persisted %d new language (%d already present)', this.counter.languages.persistCount, this.counter.languages.omitCount);
    }
  }
}

module.exports = GitIndexer;

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
  const connections = await commitDAO.processTree(this.repo, commit, currentBranch, this.urlProvider, this.gateway);

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

  // cannot link languages without files
  if (!files || files.length < 1) {
    return;
  }

  // prevent multi select of same language and prefer justCreated
  const languages = connections
    .filter((connection) => connection && connection.languageContainer && connection.languageContainer.language)
    .reduce((languages, connection) => {
      const index = languages.findIndex((language) => language._id === connection.languageContainer.language._id);
      const language = languages[index];
      const newLanguage = connection.languageContainer.language;

      if (!language) {
        return languages.concat(newLanguage);
      }
      if (!language.justCreated && newLanguage.justCreated) {
        languages.splice(index, 1, newLanguage);
      }
      return languages;
    }, []);

  const newLanguages = languages.filter((language) => language.justCreated);

  handleReporting.bind(this, 'Language')(languages, newLanguages);

  return postLanguageDataLinking.bind(this)(commit, connections, languages);
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
 * post commit linking for data that requires all given information processed by a given commit
 *
 * @param commit contains the current database object relating to the current processed commit
 * @param connections contains all processed data and the given connections
 * @param languages contains all languages used in a given commit
 */
function postLanguageDataLinking(commit, connections, languages) {
  // create or update connection between languages and commits
  if (!languages || languages.length < 1) {
    return;
  }

  // create commit linkage by used language
  return Promise.all(
    languages.map((language) => {
      const stats =
        connections
          .filter(
            (connection) =>
              connection &&
              connection.languageContainer &&
              connection.languageContainer.language &&
              connection.stats &&
              connection.languageContainer.language._id === language._id
          )
          .reduce(
            (stats, item) => {
              stats.additions += item.stats.additions;
              stats.deletions += item.stats.deletions;
              return stats;
            },
            { additions: 0, deletions: 0 }
          ) || {};

      // link commit and language
      return commit.storeConnection(language, { stats });
    })
  );
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
