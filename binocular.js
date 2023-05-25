#!/usr/bin/env node
'use strict';

console.log('Test Build');

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
 * Main entry point of the binocular application
 */

const ctx = require('./lib/context.js');

const open = require('open');
const _ = require('lodash');

const Repository = require('./lib/core/provider/git.js');
const { app, argv, httpServer, io } = require('./lib/context.js');
const config = require('./lib/config.js');
const GetIndexer = require('./lib/indexers');
const UrlProvider = require('./lib/url-providers');
const ProgressReporter = require('./lib/progress-reporter.js');
const path = require('path');
const fs = require('fs');
const Commit = require('./lib/models/Commit.js');
const File = require('./lib/models/File.js');
const Language = require('./lib/models/Language.js');
const Hunk = require('./lib/models/Hunk.js');
const Issue = require('./lib/models/Issue.js');
const Build = require('./lib/models/Build.js');
const Branch = require('./lib/models/Branch.js');
const Module = require('./lib/models/Module');
const Stakeholder = require('./lib/models/Stakeholder.js');
const CommitStakeholderConnection = require('./lib/models/CommitStakeholderConnection.js');
const IssueStakeholderConnection = require('./lib/models/IssueStakeholderConnection.js');
const IssueCommitConnection = require('./lib/models/IssueCommitConnection.js');
const CommitCommitConnection = require('./lib/models/CommitCommitConnection.js');
const CommitLanguageConnection = require('./lib/models/CommitLanguageConnection');
const CommitModuleConnection = require('./lib/models/CommitModuleConnection');
const ModuleModuleConnection = require('./lib/models/ModuleModuleConnection');
const ModuleFileConnection = require('./lib/models/ModuleFileConnection');
const LanguageFileConnection = require('./lib/models/LanguageFileConnection');
const ConfigurationError = require('./lib/errors/ConfigurationError');
const DatabaseError = require('./lib/errors/DatabaseError');
const GateWayService = require('./lib/gateway-service');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const http = require('http');
const projectStructureHelper = require('./lib/projectStructureHelper');
const commPath = path.resolve(__dirname, 'services', 'grpc', 'comm');

const LanguageDetectorPackageDefinition = protoLoader.loadSync(path.join(commPath, 'language.service.proto'), {
  enums: String,
});

const LanguageComm = grpc.loadPackageDefinition(LanguageDetectorPackageDefinition).binocular.comm;
const LanguageDetectionService = (LanguageComm || { LanguageDetectionService: () => {} }).LanguageDetectionService;

// set up the endpoints
app.get('/api/commits', require('./lib/endpoints/get-commits.js'));
app.get('/api/config', require('./lib/endpoints/get-config.js'));
app.get('/api/fileSourceCode', require('./lib/endpoints/get-fileSourceCode.js'));
app.get('/api/db-export', require('./lib/endpoints/get-db-export.js'));

// proxy to the FOXX-service
app.get('/graphQl', require('./lib/endpoints/graphQl.js'));
app.post('/graphQl', require('./lib/endpoints/graphQl.js'));

// configuration endpoint (not really used atm)
app.post('/api/config', require('./lib/endpoints/update-config.js'));

// endpoint to get the number of lines each stakeholder owns for a specific commit and a specific set of files
// used for the code expertise visualization
app.post('/api/blame/modules', require('./lib/endpoints/get-blame-modules.js'));
app.post('/api/blame/issues', require('./lib/endpoints/get-blame-issues.js'));

// endpoint to get all files of the project at the time of a certain commit
// used for the code expertise visualization
app.post('/api/files', require('./lib/endpoints/get-filenames.js'));

const port = config.get().port;

const repoWatcher = {
  listener: null,
  working: false,
  headTimestamp: null,
  headBranches: [],
};
let indexingProcess = 0;

let activeIndexingQueue = Promise.resolve();
const indexers = {
  vcs: null,
  its: null,
  ci: null,
};

const services = [];

const gatewayService = new GateWayService();
const reporter = new ProgressReporter(io, ['commits', 'issues', 'builds', 'files', 'languages', 'filesLanguage', 'modules']);
let databaseConnection = null;

/**
 * init and start database if it has not been started and start indexers
 * @param context get current context
 * @param gateway holds gateway service to handle various remote services
 *
 * @returns {Promise<*>}
 */
async function startDatabase(context, gateway) {
  const repository = await Repository.fromPath(ctx.targetPath);

  context.repo = repository;
  config.setSource(repository.pathFromRoot('.binocularrc'));

  if (databaseConnection === null) {
    // configure everything in the context
    require('./lib/core/db/setup-db.js');
    while (databaseConnection === null) {
      try {
        databaseConnection = await ensureDb(repository, context);
      } catch (error) {
        if (error && error.name === DatabaseError.name) {
          databaseConnection = null;
          console.error(`A ${error.name} occurred and returns the following message: ${error.message}!`);
          console.log('wait 5 seconds until retry!');
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    //writeConfigToFrontend
    projectStructureHelper.writeContextToFrontend(ctx, config);
    // immediately run all indexers
    return (activeIndexingQueue = Promise.all([
      repoUpdateHandler(repository, context, gateway),
      reIndex(indexers, context, reporter, gateway, activeIndexingQueue, ++indexingProcess),
    ]));
  }
}

/**
 * setup reindex on repository updates
 *
 * @param repository contains the repository of the defined context
 * @param context holds the current program context
 * @param gateway holds gateway service to handle various remote services
 *
 * @returns {Promise<void>}
 */
async function repoUpdateHandler(repository, context, gateway) {
  if (repoWatcher.listener) {
    return;
  }
  // path to the repository head file
  const headPath = await repository.getHeadPath();

  if (!fs.existsSync(headPath)) {
    return;
  }

  repoWatcher.headBranches = await getFetchedBranches(headPath);

  repoWatcher.headTimestamp = fs.statSync(headPath).mtime.valueOf();
  // create watchdog of the head file to detect changes
  repoWatcher.listener = fs.watch(headPath, async (event, file) => {
    if (file && !repoWatcher.working) {
      repoWatcher.working = true;
      const currentFileTime = fs.statSync(headPath).mtime.valueOf();
      if (currentFileTime === repoWatcher.headTimestamp) {
        repoWatcher.working = false;
        return;
      }

      repoWatcher.headTimestamp = currentFileTime;
      const branches = await getFetchedBranches(headPath);

      // make sure that the reindex is only triggered if the content has really changed
      if (branches.length > 0 && !_.isEqual(repoWatcher.headBranches, branches)) {
        repoWatcher.headBranches = branches;
        threadLog(++indexingProcess, 'Repository update: Restart all indexers!');
        activeIndexingQueue = reIndex(indexers, context, reporter, gateway, activeIndexingQueue, indexingProcess);
      }
      repoWatcher.working = false;
    }
  });
}

/**
 * get all fetched branches that are stored in the corresponding file
 *
 * @param file
 * @returns {Promise<*>}
 */
async function getFetchedBranches(file) {
  if (!fs.existsSync(file)) {
    return [];
  }
  return new Promise((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, content) => {
      if (err) {
        return reject(err);
      } else if (content && content.length > 0) {
        const branchMatcher = /^([^\n\t]*).*?['"]([^\n\t]*)['"].*?$/gm;
        const branches = [];
        let match;
        while ((match = branchMatcher.exec(content))) {
          if (match.length === 3) {
            branches.push({ branch: match[2], sha: match[1] });
          }
        }
        return resolve(branches);
      }
      return resolve([]);
    })
  );
}

// be sure to re-index when the configuration changes
config.on('updated', async () => {
  return await startDatabase(ctx, gatewayService);
});

/**
 * restart indexing process if it has be started already
 *
 * @param indexers object that holds the indexers of the three data sources
 * @param context contains the context of the whole service
 * @param reporter contains the reporter object that holds the current progress of the indexers
 * @param gateway holds gateway service to handle various remote services
 * @param currentQueuePosition get the current async function of the indexing queue
 * @param indexingThread match the messages to the corresponding thread
 *
 * @returns {*}
 */
async function reIndex(indexers, context, reporter, gateway, currentQueuePosition, indexingThread) {
  await stopIndexers(gateway);
  await currentQueuePosition;
  return indexing(indexers, ctx, reporter, gateway, indexingThread);
}

/**
 * adds all indexers if they has not been set and executes the indexing job.
 *
 * @param indexers object that holds the indexers of the three data sources
 * @param context contains the context of the whole service
 * @param reporter contains the reporter object that holds the current progress of the indexers
 * @param gateway holds gateway service to handle various remote services
 * @param indexingThread match the messages to the corresponding thread
 * @returns {*}
 */
async function indexing(indexers, context, reporter, gateway, indexingThread) {
  threadLog(indexingThread, 'Indexing data...');
  gateway.startIndexing();

  try {
    context.vcsUrlProvider = await UrlProvider.getVcsUrlProvider(context.repo, reporter, context);
    context.ciUrlProvider = await UrlProvider.getCiUrlProvider(context.repo, reporter, context);
    const indexer = await getIndexer(indexers, context, reporter, indexingThread);
    const providers = await Promise.all(indexer);

    /*for (const indexer of providers.filter((exist) => exist)) {
      if (!indexer) {
        return;
      }

      if ('setGateway' in indexer) {
        indexer.setGateway(gateway);
      }

      threadLog(indexingThread, `${indexer.constructor.name} fetching data...`);
      await indexer.index();
      threadLog(indexingThread, `${indexer.constructor.name} ${indexer.isStopping() ? 'stopped' : 'finished'}...`);
    }
    // make sure that the services has not been stopped
    const activeProviders = providers.filter((provider) => {
      return !provider || !provider.isStopping();
    });*/
    // start indexer
    const activeIndexers = await Promise.all(
      providers
        .filter((exist) => exist)
        .map(async (indexer) => {
          if (!indexer) {
            return;
          }

          if ('setGateway' in indexer) {
            indexer.setGateway(gateway);
          }

          threadLog(indexingThread, `${indexer.constructor.name} fetching data...`);
          await indexer.index();
          threadLog(indexingThread, `${indexer.constructor.name} ${indexer.isStopping() ? 'stopped' : 'finished'}...`);
          return indexer;
        })
    );

    // make sure that the services has not been stopped
    const activeProviders = activeIndexers.filter((provider) => {
      return !provider || !provider.isStopping();
    });

    if (activeProviders.length < 1) {
      threadLog(indexingThread, 'All indexers stopped!');
      return;
    }
    Promise.all([Commit.deduceStakeholders(), Issue.deduceStakeholders()]).then(() => {
      threadLog(indexingThread, 'Indexing finished');
      projectStructureHelper.checkProjectStructureAndFix();
    });
    createManualIssueReferences(config.get('issueReferences'));
  } catch (error) {
    if (error && 'name' in error && error.name === 'Gitlab401Error') {
      threadWarn(indexingThread, 'Unable to access GitLab API. Please configure a valid private access token in the UI.');
    } else {
      throw error;
    }
  }
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
  indexHandler.push(
    async () => (indexers.vcs = await GetIndexer.makeVCSIndexer(context.repo, context.vcsUrlProvider, reporter, context, true))
  );

  if (context.argv.its) {
    indexHandler.push(optionalIndexerHandler.bind(this, indexingThread, 'its', context.repo, reporter, context, GetIndexer.makeITSIndexer));
  }

  if (context.argv.ci) {
    indexHandler.push(optionalIndexerHandler.bind(this, indexingThread, 'ci', context.repo, reporter, context, GetIndexer.makeCIIndexer));
  }

  //wait until all indexers have been finished
  return indexHandler.map(async (index) => await index());
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
      if ('name' in error && error.name === ConfigurationError.name) {
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

process.on('error', (error) => console.log(error));

process.on('SIGINT', stop);

async function stop() {
  // must be closed before brute-force killing
  stopRepoListener();

  if (ctx.isStopping()) {
    console.log('Shutting down immediately!');
    process.exit(1);
  }

  console.log('Let me finish up here, ... (Ctrl+C to force quit)');

  const stopServers = services.filter((srv) => srv && typeof srv.stop === 'function').map((srv) => srv.stop());

  ctx.quit();
  config.stop();

  if (activeIndexingQueue) {
    await stopIndexers(gatewayService);
    await activeIndexingQueue;
    activeIndexingQueue = null;
  }
  await Promise.all(stopServers);
}

/**
 * close change listener
 */
function stopRepoListener() {
  if (!repoWatcher.listener) {
    return;
  }
  repoWatcher.listener.close();
  repoWatcher.listener = null;
  repoWatcher.working = false;
}

/**
 * stop all indexers and wait until the indexing process has stopped
 *
 * @returns {Promise<*>}
 */
async function stopIndexers(gateway) {
  gateway.stopIndexing();
  await Promise.all(
    _(indexers)
      .values()
      .filter((indexer) => indexer !== null)
      .each(async (indexPromise) => {
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
    .ensureDatabase('binocular-' + repo.getName())
    .catch((e) => {
      throw new DatabaseError(e.message);
    })
    .then(function () {
      if (argv.clean) {
        return context.db.truncate();
      }
    })
    .then(() => {
      return Promise.all([
        context.db.ensureService(path.join(__dirname, 'foxx'), '/binocular-ql'),
        Commit.ensureCollection(),
        Language.ensureCollection(),
        File.ensureCollection(),
        Hunk.ensureCollection(),
        Stakeholder.ensureCollection(),
        Issue.ensureCollection(),
        Build.ensureCollection(),
        Branch.ensureCollection(),
        Module.ensureCollection(),
        LanguageFileConnection.ensureCollection(),
        CommitStakeholderConnection.ensureCollection(),
        IssueStakeholderConnection.ensureCollection(),
        IssueCommitConnection.ensureCollection(),
        CommitCommitConnection.ensureCollection(),
        CommitLanguageConnection.ensureCollection(),
        CommitModuleConnection.ensureCollection(),
        ModuleModuleConnection.ensureCollection(),
        ModuleFileConnection.ensureCollection(),
      ]);
    });
}

function createManualIssueReferences(issueReferences) {
  return Promise.all(
    _.keys(issueReferences).map((sha) => {
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

        const existingMention = _.find(issue.mentions, (mention) => mention.commit === sha);
        if (!existingMention) {
          issue.mentions.push({
            createdAt: commit.date,
            commit: sha,
            manual: true,
          });
          return issue.save();
        }
      });
    })
  );
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
    console.trace(error.stack);
    try {
      await stop();
      // eslint-disable-next-line no-empty
    } catch (ignore) {}
  }
}

// start services
Promise.all(
  [
    () => {
      // start web server
      httpServer.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
        if (argv.ui && argv.open) {
          open(`http://localhost:${port}/`);
        }
      });
    },
    // start database
    startDatabase.bind(this, ctx, gatewayService),
    // start gateway
    (async (context, config, gateway) => {
      services.push(gateway);
      await gateway.configure(config.get('gateway'));
      gateway.addServiceHandler('LanguageDetection', (service) => {
        service.comm = new LanguageDetectionService(`${service.client.address}:${service.client.port}`, grpc.credentials.createInsecure());
        reIndex(indexers, context, reporter, gateway, activeIndexingQueue, ++indexingProcess);
      });

      return gateway.start();
    }).bind(this, ctx, config, gatewayService),
  ].map((entryPoint) => serviceStarter(entryPoint))
).then(() => {
  // if no-server flag set stop immediately after indexing
  if (!ctx.argv.server) {
    stop();
  }
});
