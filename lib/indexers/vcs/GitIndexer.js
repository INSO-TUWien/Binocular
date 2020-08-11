'use strict';

const debug = require('debug');
const serve = debug('idx:vcs:git');
const log = debug('log:idx:vcs:git');
const _ = require('lodash');
const Commit = require('../../models/Commit.js');
const File = require('../../models/File.js');

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
        persistCount: 0
      },
      languages: {
        total: 0,
        omitCount: 0,
        persistCount: 0,
        cache: new Set()
      },
      files: {
        total: 0,
        omitCount: 0,
        persistCount: 0,
        cache: new Set()
      },
      langFile: {
        total: 0,
        omitCount: 0,
        persistCount: 0
      }
    };
  }

  /**
   * start local repo indexing and processing all existing commits
   *
   * @returns {Promise<void>}
   */
  async index() {
    this.stopping = false;

    log('Counting commits...');
    this.resetCounter();

    await this.repo.walk(() => this.counter.commits.total++);
    if ('setCommitCount' in this.reporter && typeof this.reporter.setCommitCount === 'function') {
      this.reporter.setCommitCount(this.counter.commits.total);
    }

    if ('setLanguageCount' in this.reporter && typeof this.reporter.setLanguageCount === 'function') {
      this.reporter.setLanguageCount(this.counter.languages.total);
    }
    if ('setFilesLanguageCount' in this.reporter && typeof this.reporter.setFilesLanguageCount === 'function') {
      this.reporter.setFilesLanguageCount(this.counter.langFile.total);
    }

    log('Processing', this.counter.commits.total, 'commits');
    await this.repo.walk(processCommit.bind(this));

    this.printStats();

    // clear cache
    this.counter.languages.cache.clear();
    this.counter.files.cache.clear();

    log('Deducing file lengths...');
    await File.deduceMaxLengths();
    log('Done');
  }

  /**
   *  stop actual indexing process
   */
  stop() {
    log('Stopping');
    this.stopping = true;
  }

  isStopping() {
    return this.stopping;
  }

  /**
   * debug print statistic of processed data
   */
  printStats() {
    log('Persisted %d new commits (%d already present)', this.counter.commits.persistCount, this.counter.commits.omitCount);
    log('Persisted %d new files (%d already present)', this.counter.files.persistCount, this.counter.files.omitCount);
    log('Persisted %d new language (%d already present)', this.counter.languages.persistCount, this.counter.languages.omitCount);
  }
}

module.exports = GitIndexer;

/**
 * process the given commit
 *
 * @param commit contains the current commit that should be processed
 * @returns {Promise<void>}
 */
async function processCommit(commit) {
  if (this.stopping) {
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
  const connections = await commitDAO.processTree(this.repo, commit, this.urlProvider, this.gateway);
  return postProcessing.bind(this)(commitDAO, _.flatten(connections || []).filter(exist => exist));
}

/**
 * show connection statistic and create language related commit connection
 *
 * @param commit
 * @param connections holds an array of all created connections and objects that refers th the current commit
 */
async function postProcessing(commit, connections) {
  if (!connections || connections.length < 1) {
    return;
  }

  const files = _.uniq(
    connections.filter(connection => connection && connection.file).reduce((reduction, connection) => {
      return reduction.concat(connection.file);
    }, [])
  );
  const newFiles = files.filter(file => file.justCreated);

  handleFileReporting.bind(this)(files, newFiles);

  // cannot link languages without files
  if (!files || files.length < 1) {
    return;
  }

  // prevent multi select of same language
  const languages = _.uniqBy(
    connections
      .filter(
        connection =>
          connection && connection.languageContainer && connection.languageContainer.enabled && connection.languageContainer.language
      )
      .reduce((languages, connection) => languages.concat(connection.languageContainer.language), []),
    language => language.name
  );

  const newLanguages = languages.filter(language => language.justCreated);

  handleLanguageReporting.bind(this)(languages, newLanguages);

  return postDataLinking.bind(this)(commit, connections, languages);
}

/**
 * post commit linking for data that requires all given information processed by a given commit
 *
 * @param commit
 * @param connections contains all processed data and the given connections
 * @param languages contains all languages used in a given commit
 */
function postDataLinking(commit, connections, languages) {
  // create or update connection between languages and commits
  if (!languages || languages.length < 1) {
    return;
  }

  // create commit linkage by used language
  return Promise.all(
    languages.map(language => {
      const stats =
        connections
          .filter(
            connection =>
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
      return commit.connect(language, { stats });
    })
  );
}

/**
 * change statistic and print and send current progress of all files
 *
 * @param files
 * @param newFiles
 */
function handleFileReporting(files, newFiles) {
  const emitCount = adjustStatistic.bind(this)('files', files, newFiles);

  for (let index = 0; index < emitCount; index++) {
    if ('finishFile' in this.reporter && typeof this.reporter.finishFile === 'function') {
      this.reporter.finishFile();
    }
  }
}

/**
 * change statistic and print and send current progress of all languages
 *
 * @param languages
 * @param newLanguages
 */
function handleLanguageReporting(languages, newLanguages) {
  const emitCount = adjustStatistic.bind(this)('languages', languages, newLanguages);

  for (let index = 0; index < emitCount; index++) {
    if ('finishLanguage' in this.reporter && typeof this.reporter.finishLanguage === 'function') {
      this.reporter.finishLanguage();
    }
  }
}

/**
 * adjust statistic of counter entries that uses a cache
 *
 * @param key
 * @param list
 * @param newElements
 * @returns {number}
 */
function adjustStatistic(key, list, newElements) {
  if (!list || list.length < 0 || !newElements || !this.counter[key]) {
    return 0;
  }

  list.forEach(item => {
    this.counter[key].cache.add(item._id);
  });

  this.counter[key].persistCount += newElements.length;
  this.counter[key].total = this.counter[key].cache.size;
  const emitCount = this.counter[key].cache.size - this.counter[key].persistCount - this.counter[key].omitCount;
  this.counter[key].omitCount = this.counter[key].cache.size - this.counter[key].persistCount;
  if (newElements.length > 0) {
    serve(`${newElements.length}/${this.counter[key].total} ${key} in current commit processed`);
  }
  return emitCount;
}
