#!/usr/bin/env node
'use strict';

// init timestamp for output
import Moment from 'moment';
import log_timestamp from 'log-timestamp';

const startTime = Moment.now();
console.log('Start Time: ' + Moment(startTime).format());
log_timestamp(() => '[' + Moment().format('DD-MM-YYYY, HH:mm:ss') + ']');

function threadLog(thread) {
  console.log(`[thread=${thread}]`, [...arguments].slice(1).join(' '));
}

function threadWarn(thread) {
  console.warn(`[thread=${thread}]`, [...arguments].slice(1).join(' '));
}

/**
 * Main entry point of the binocular application
 */

import ctx from './lib/context.js';

import open from 'open';
import _ from 'lodash';

import git from './lib/core/provider/git.js';
import config from './lib/config';
import * as GetIndexer from './lib/indexers/index.js';
import * as UrlProvider from './lib/url-providers/index.js';
import ProgressReporter from './lib/progress-reporter';
import path from 'path';
import fs from 'fs';
import Commit from './lib/models/Commit.js';
import File from './lib/models/File.js';
import Hunk from './lib/models/Hunk.js';
import Issue from './lib/models/Issue.js';
import Build from './lib/models/Build.js';
import Branch from './lib/models/Branch.js';
import Module from './lib/models/Module.js';
import Stakeholder from './lib/models/Stakeholder.js';
import MergeRequest from './lib/models/MergeRequest.js';
import Milestone from './lib/models/Milestone.js';
import CommitStakeholderConnection from './lib/models/CommitStakeholderConnection.js';
import IssueStakeholderConnection from './lib/models/IssueStakeholderConnection.js';
import IssueCommitConnection from './lib/models/IssueCommitConnection.js';
import CommitCommitConnection from './lib/models/CommitCommitConnection.js';
import CommitModuleConnection from './lib/models/CommitModuleConnection.js';
import ModuleModuleConnection from './lib/models/ModuleModuleConnection.js';
import ModuleFileConnection from './lib/models/ModuleFileConnection.js';
import BranchFileConnection from './lib/models/BranchFileConnection.js';
import BranchFileFileConnection from './lib/models/BranchFileFileConnection.js';
import CommitFileStakeholderConnection from './lib/models/CommitFileStakeholderConnection.js';
import CommitFileConnection from './lib/models/CommitFileConnection.js';
import CommitBuildConnection from './lib/models/CommitBuildConnection.js';
import ConfigurationError from './lib/errors/ConfigurationError.js';
import DatabaseError from './lib/errors/DatabaseError.js';
import GateWayService from './lib/gateway-service.js';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as projectStructureHelper from './lib/projectStructureHelper';

import * as getDbExportEndpoint from './lib/endpoints/get-db-export.js';

import * as graphQlEndpoint from './lib/endpoints/graphQl.js';

import * as setupDb from './lib/core/db/setup-db.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commPath = path.resolve(__dirname, 'services', 'grpc', 'comm');

const LanguageDetectorPackageDefinition = protoLoader.loadSync(path.join(commPath, 'language.service.proto'), {
  enums: String,
});

const LanguageComm = grpc.loadPackageDefinition(LanguageDetectorPackageDefinition).binocular.comm;
const LanguageDetectionService = (
  LanguageComm || {
    LanguageDetectionService: () => {
      console.log('No Language Detection Service!');
    },
  }
).LanguageDetectionService;

// set up the endpoints
ctx.app.get('/api/db-export', getDbExportEndpoint.default);

// proxy to the FOXX-service
ctx.app.get('/graphQl', graphQlEndpoint.default);
ctx.app.post('/graphQl', graphQlEndpoint.default);

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
const reporter = new ProgressReporter(ctx.io, ['commits', 'issues', 'builds', 'files', 'modules', 'mergeRequests', 'milestones']);
let databaseConnection = null;

/**
 * init and start database if it has not been started and start indexers
 * @param context get current context
 * @param gateway holds gateway service to handle various remote services
 *
 * @returns {Promise<*>}
 */
async function startDatabase(context, gateway) {
  const repository = await git.fromPath(ctx.targetPath);

  context.repo = repository;
  config.setSource(repository.pathFromRoot('.binocularrc'));
  // configure everything in the context
  setupDb.default();
  if (databaseConnection === null) {
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

    await Issue.deduceStakeholders();
    createManualIssueReferences(config.get('issueReferences'));
    projectStructureHelper.checkProjectStructureAndFix();

    //now that the indexers have finished, we have VCS, ITS and CI data and can connect them.
    // for that purpose, references between e.g. issues and commits have been stored in the collections.
    // exmaple: issue has a `mentions` field that contains hashes of commits that mention the issue.
    // since all indexers run simultaniously, we cant connect the collections right away.
    // This is why we connect them here and then delete the temporary references in the collections themselves
    // (like the `mentions` field in issues).
    await connectIssuesAndCommits();
    await connectCommitsAndBuilds();
    const endTime = Moment.now();
    console.log('End Time: ' + Moment(endTime).format());
    const executionTime = Moment(endTime).diff(startTime, 'seconds');
    console.log('Execution Time: ' + parseInt(executionTime / 60) + ':' + (executionTime % 60));
    threadLog(indexingThread, 'Indexing finished');
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
    async () => (indexers.vcs = await GetIndexer.makeVCSIndexer(context.repo, context.vcsUrlProvider, reporter, context.argv.clean))
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
      if (ctx.argv.clean) {
        return context.db.truncate();
      }
    })
    .then(() => {
      return Promise.all([
        context.db.ensureService(path.join(__dirname, 'foxx'), '/binocular-ql'),
        Commit.ensureCollection(),
        File.ensureCollection(),
        Hunk.ensureCollection(),
        Stakeholder.ensureCollection(),
        Issue.ensureCollection(),
        Build.ensureCollection(),
        Branch.ensureCollection(),
        Module.ensureCollection(),
        MergeRequest.ensureCollection(),
        Milestone.ensureCollection(),
        CommitFileConnection.ensureCollection(),
        CommitBuildConnection.ensureCollection(),
        CommitStakeholderConnection.ensureCollection(),
        IssueStakeholderConnection.ensureCollection(),
        IssueCommitConnection.ensureCollection(),
        CommitCommitConnection.ensureCollection(),
        CommitModuleConnection.ensureCollection(),
        ModuleModuleConnection.ensureCollection(),
        ModuleFileConnection.ensureCollection(),
        BranchFileConnection.ensureCollection(),
        BranchFileFileConnection.ensureCollection(),
        CommitFileStakeholderConnection.ensureCollection(),
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

        const existingMention = find(issue.mentions, (mention) => mention.commit === sha);
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
      ctx.httpServer.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
        if (ctx.argv.ui && ctx.argv.open) {
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

      return gateway.start();
    }).bind(this, ctx, config, gatewayService),
  ].map((entryPoint) => serviceStarter(entryPoint))
).then(() => {
  // if no-server flag set stop immediately after indexing
  if (!ctx.argv.server) {
    stop();
  }
});

async function connectIssuesAndCommits() {
  const issues = await Issue.findAll();
  const commits = await Commit.findAll();

  //at this point, most issues have a mentions attribute which stores the sha hashes of the commits that mention the issue.
  //connect these commits to the issue:
  for (const issue of issues) {
    //some issues are not mentioned by any commits
    if (!issue.mentions) continue;
    for (const mention of issue.mentions) {
      const commit = commits.filter((c) => c.sha === mention.commit);
      if (commit && commit[0]) {
        issue.connect(commit[0], { closes: mention.closes });
      }
    }
  }
  //remove the temporary `mentions` attribute since we have the connections now
  await Issue.deleteMentionsAttribute();
}

async function connectCommitsAndBuilds() {
  const builds = await Build.findAll();
  const commits = await Commit.findAll();

  for (const build of builds) {
    if (!build.sha) continue;
    const commit = commits.filter((c) => c.sha === build.sha);
    if (commit && commit[0]) {
      commit[0].connect(build);
    }
  }

  await Build.deleteShaRefAttributes();
}
