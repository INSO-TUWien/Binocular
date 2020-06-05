#!/usr/bin/env node
'use strict';

// init timestamp for output
const Moment = require('moment');
require('log-timestamp')(() => '[' + Moment().format('DD-MM-YYYY, HH:mm:ss') + ']');

function threadLog(thread) {
  console.log(`[thread=${thread}]`, [...arguments].slice(1).join(' '));
}

function threadWarn(thread) {
  console.warn(`[thread=${thread}]`, [...arguments].slice(1).join(' '));
}

/**
 * Main entry point of the pupil application
 */

const ctx = require('./lib/context.js');

const opn = require('opn');
const _ = require('lodash');
const Promise = require('bluebird');

Promise.config({
  longStackTraces: true
});

const Repository = require('./lib/git.js');
const { app, argv, httpServer, io } = require('./lib/context.js');
const config = require('./lib/config.js');
const GetIndexer = require('./lib/indexers');
const UrlProvider = require('./lib/url-providers');
const ProgressReporter = require('./lib/progress-reporter.js');
const path = require('path');
const fs = require('fs');
const Commit = require('./lib/models/Commit.js');
const File = require('./lib/models/File.js');
const Hunk = require('./lib/models/Hunk.js');
const Issue = require('./lib/models/Issue.js');
const Build = require('./lib/models/Build.js');
const Stakeholder = require('./lib/models/Stakeholder.js');
const CommitStakeholderConnection = require('./lib/models/CommitStakeholderConnection.js');
const IssueStakeholderConnection = require('./lib/models/IssueStakeholderConnection.js');
const IssueCommitConnection = require('./lib/models/IssueCommitConnection.js');
const CommitCommitConnection = require('./lib/models/CommitCommitConnection.js');
const ConfigurationError = require('./lib/errors/ConfigurationError');
const DatabaseError = require('./lib/errors/DatabaseError');

// set up the endpoints
app.get('/api/commits', require('./lib/endpoints/get-commits.js'));
app.get('/api/config', require('./lib/endpoints/get-config.js'));

// proxy to the FOXX-service
app.get('/graphQl', require('./lib/endpoints/graphQl.js'));
app.post('/graphQl', require('./lib/endpoints/graphQl.js'));

// configuration endpoint (not really used atm)
app.post('/api/config', require('./lib/endpoints/update-config.js'));

const port = config.get().port;
let repoWatcher;
let previousHeadTimestamp;
let indexingProcess = 0;

let activeIndexingQueue = Promise.resolve();
const indexers = {
  vcs: null,
  its: null,
  ci: null
};

const reporter = new ProgressReporter(io, ['commits', 'issues', 'builds']);
let databaseConnection = null;

/**
 * init and start database if it has not been started and start indexers
 * @param context get current context
 *
 * @returns {Promise<*>}
 */
async function startDatabase(context) {
  const repository = await Repository.fromPath(ctx.targetPath);

  context.repo = repository;
  config.setSource(repository.pathFromRoot('.pupilrc'));

  if (databaseConnection === null) {
    // configure everything in the context
    require('./lib/setup-db.js');
    try {
      databaseConnection = await ensureDb(repository, context);
    } catch (error) {
      if (repoWatcher) {
        repoWatcher.close();
        repoWatcher = null;
      }

      if (error && error.name === DatabaseError.name) {
        databaseConnection = null;
        console.error(`A ${error.name} occurred and returns the following message: ${error.message}!`);
        return;
      }
      throw error;
    }
  }

  // immediately run all indexers
  return (activeIndexingQueue = Promise.all([
    repoUpdateHandler(repository),
    reIndex(indexers, ctx, reporter, activeIndexingQueue, indexingProcess++)
  ]));
}

/**
 * setup reindex on repository updates
 *
 * @param repository contains the repository of the defined context
 * @returns {Promise<void>}
 */
async function repoUpdateHandler(repository) {
  if (repoWatcher) {
    return;
  }
  // path to the repository head file
  const headPath = await repository.getHeadPath();

  previousHeadTimestamp = fs.statSync(headPath).mtime.valueOf();
  // create watchdog of the head file to detect changes
  repoWatcher = fs.watch(headPath, (event, file) => {
    if (file) {
      const currentFileTime = fs.statSync(headPath).mtime.valueOf();
      if (currentFileTime === previousHeadTimestamp) {
        return;
      }
      previousHeadTimestamp = currentFileTime;
      threadLog(indexingProcess++, 'Repository update: Restart all indexers!');
      activeIndexingQueue = reIndex(indexers, ctx, reporter, activeIndexingQueue, indexingProcess);
    }
  });
}

// be sure to re-index when the configuration changes
config.on('updated', async () => {
  return await startDatabase();
});

/**
 * restart indexing process if it has be started already
 *
 * @param indexers object that holds the indexers of the three data sources
 * @param context contains the context of the whole service
 * @param reporter contains the reporter object that holds the current progress of the indexers
 * @param currentQueuePosition get the current async function of the indexing queue
 * @param indexingThread match the messages to the corresponding thread
 * @returns {*}
 */
async function reIndex(indexers, context, reporter, currentQueuePosition, indexingThread) {
  await stopIndexers();
  await currentQueuePosition;
  return indexing(indexers, ctx, reporter, indexingThread);
}

/**
 * adds all indexers if they has not been set and executes the indexing job.
 *
 * @param indexers object that holds the indexers of the three data sources
 * @param context contains the context of the whole service
 * @param reporter contains the reporter object that holds the current progress of the indexers
 * @param indexingThread match the messages to the corresponding thread
 * @returns {*}
 */
async function indexing(indexers, context, reporter, indexingThread) {
  threadLog(indexingThread, 'Indexing data...');

  try {
    context.vcsUrlProvider = await UrlProvider.getVcsUrlProvider(context.repo, reporter, context);
    context.ciUrlProvider = await UrlProvider.getCiUrlProvider(context.repo, reporter, context);
    const providers = await Promise.all(getIndexer(indexers, context, reporter, indexingThread));

    // start indexer
    const activeIndexers = await Promise.all(
      providers.filter(indexer => indexer !== null).map(async indexer => {
        const provider = indexer;
        if (provider) {
          threadLog(indexingThread, `${provider.constructor.name} fetching data...`);
          await provider.index();
          threadLog(indexingThread, `${provider.constructor.name} ${provider.isStopping() ? 'stopped' : 'finished'}...`);
          return provider;
        }
      })
    );

    // make sure that the services has not been stopped
    const activeProviders = activeIndexers.filter(provider => {
      return !provider || !provider.isStopping();
    });

    if (activeProviders.length < 1) {
      threadLog(indexingThread, 'All indexers stopped!');
      return;
    }

    // setup references
    Commit.deduceStakeholders();
    Issue.deduceStakeholders();
    createManualIssueReferences(config.get('issueReferences'));
  } catch (error) {
    if (error && 'name' in error && error.name === 'Gitlab401Error') {
      threadWarn(indexingThread, 'Unable to access GitLab API. Please configure a valid private access token in the UI.');
    } else {
      throw error;
    }
  }
  threadLog(indexingThread, 'Indexing finished');
}

/**
 * Add all handlers to the indexer object if they has not been set already.
 * If an optional indexer fails relating to a configuration issue, the index should be null.
 *
 * @param indexingThread match the messages to the corresponding thread
 * @param indexers object that holds the indexers of the three data sources
 * @param context contains the context of the whole service
 * @param reporter contains the reporter object that holds the current progress of the indexers
 * @returns {*}
 */
async function getIndexer(indexers, context, reporter, indexingThread) {
  if (!indexers) {
    indexers = {};
  }

  // stores all indexer to call them async
  const indexHandler = [];
  indexHandler.push(async () => (indexers.vcs = await GetIndexer.makeVCSIndexer(context.repo, reporter, context, true)));

  if (context.argv.its) {
    indexHandler.push(optionalIndexerHandler.bind(this, indexingThread, 'its', context.repo, reporter, context, GetIndexer.makeITSIndexer));
  }

  if (context.argv.ci) {
    indexHandler.push(optionalIndexerHandler.bind(this, indexingThread, 'ci', context.repo, reporter, context, GetIndexer.makeCIIndexer));
  }

  //wait until all indexers have been finished
  return indexHandler.map(async index => await index());
}

/**
 * call and handle the configuration of optional indexers
 *
 * @param indexingThread match the messages to the corresponding thread
 * @param key contains the name of the indexer
 * @param repository contains the repository
 * @param reporter contains the reporter object that holds the current progress of the indexers
 * @param context contains the context of the application
 * @param asyncIndexCreator contains the creator function for the corresponding indexer
 * @returns {Promise<*>} returns the indexer if the indexer has been created successfully, otherwise it will return null
 */
async function optionalIndexerHandler(indexingThread, key, repository, reporter, context, asyncIndexCreator) {
  try {
    indexers[key] = await asyncIndexCreator(repository, reporter, context, true);
  } catch (error) {
    if (error) {
      if ('name' in error && ConfigurationError.name) {
        threadWarn(
          indexingThread,
          `The following indexer "${key}" failed with "${error.name}" and holds the following message: ${error.message}`
        );
      } else {
        throw error;
      }
    }
    indexers[key] = null;
  }
  return indexers[key];
}

process.on('SIGINT', stop);

async function stop() {
  if (ctx.isStopping()) {
    console.log('Shutting down immediately!');
    process.exit(1);
  }

  console.log('Let me finish up here, ... (Ctrl+C to force quit)');

  ctx.quit();
  config.stop();

  if (repoWatcher) {
    repoWatcher.close();
    repoWatcher = null;
  }

  if (activeIndexingQueue) {
    await stopIndexers();
    await activeIndexingQueue;
    activeIndexingQueue = null;
  }
}

/**
 * stop all indexers and wait until the indexing process has stopped
 *
 * @returns {Promise<*>}
 */
async function stopIndexers() {
  await Promise.all(
    _(indexers).values().filter(indexer => indexer !== null).each(async indexPromise => {
      const index = await indexPromise;
      if (index) {
        index.stop();
      }
    })
  );
}

/**
 * Ensures that the db is set up correctly and the GraphQL-Service is installed
 * @param repo contains the repository
 * @param context get the current context
 */
function ensureDb(repo, context) {
  return context.db
    .ensureDatabase('pupil-' + repo.getName())
    .catch(e => {
      throw new DatabaseError(e.message);
    })
    .then(function() {
      if (argv.clean) {
        return context.db.truncate();
      }
    })
    .then(() => {
      return Promise.join(
        context.db.ensureService(path.join(__dirname, 'foxx'), '/pupil-ql'),
        Commit.ensureCollection(),
        File.ensureCollection(),
        Hunk.ensureCollection(),
        Stakeholder.ensureCollection(),
        Issue.ensureCollection(),
        Build.ensureCollection(),
        CommitStakeholderConnection.ensureCollection(),
        IssueStakeholderConnection.ensureCollection(),
        IssueCommitConnection.ensureCollection(),
        CommitCommitConnection.ensureCollection()
      );
    });
}

function createManualIssueReferences(issueReferences) {
  return Promise.map(_.keys(issueReferences), sha => {
    const iid = issueReferences[sha];

    return Promise.join(Commit.findOneBySha(sha), Issue.findOneByIid(iid)).spread((commit, issue) => {
      if (!commit) {
        console.warn(`Ignored issue #${iid} referencing non-existing commit ${sha}`);
        return;
      }
      if (!issue) {
        console.warn(`Ignored issue #${iid} referencing commit ${sha} because the issue does not exist`);
        return;
      }

      const existingMention = _.find(issue.mentions, mention => mention.commit === sha);
      if (!existingMention) {
        issue.mentions.push({
          createdAt: commit.date,
          commit: sha,
          manual: true
        });
        return issue.save();
      }
    });
  });
}

/**
 * catches errors and stops all services gracefully
 *
 * @param serviceEntry contains the actual service entry-point that should be observed
 * @returns {Promise<void>}
 */
async function serviceStarter(serviceEntry) {
  try {
    await serviceEntry();
  } catch (error) {
    console.error(error);
    try {
      await stop();
      // eslint-disable-next-line no-empty
    } catch (ignore) {}
    throw error;
  }
}

// start services
Promise.all([
  serviceStarter(() => {
    httpServer.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
      if (argv.ui && argv.open) {
        opn(`http://localhost:${port}/`);
      }
    });
  }),
  serviceStarter(startDatabase.bind(this, ctx))
]);
