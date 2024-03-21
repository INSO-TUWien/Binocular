#!/usr/bin/env node
'use strict';

import cli from './cli/cli';

// init timestamp for output
import Moment from 'moment';
import console_stamp from 'console-stamp';
let startTime: number;

function threadLog(thread: number, message: string) {
  console.log(`[thread=${thread}]`, message);
}

function threadWarn(thread: number, message: string) {
  console.warn(`[thread=${thread}]`, message);
}

/**
 * Main entry point of the binocular application
 */

import ctx from './utils/context';

import open from 'open';
import _ from 'lodash';

import config from './utils/config';
import * as GetIndexer from './indexers';
import * as UrlProvider from './url-providers';
import ProgressReporter from './utils/progress-reporter';
import path from 'path';
import fs from 'fs';
import Commit from './models/models/Commit.ts';
import File from './models/models/File.ts';
import Issue from './models/models/Issue.ts';
import Build from './models/models/Build.ts';
import Branch from './models/models/Branch.ts';
import Module from './models/models/Module.ts';
import Stakeholder from './models/models/Stakeholder.ts';
import MergeRequest from './models/models/MergeRequest.ts';
import Milestone from './models/models/Milestone.ts';
import CommitStakeholderConnection from './models/connections/CommitStakeholderConnection.ts';
import IssueStakeholderConnection from './models/connections/IssueStakeholderConnection.ts';
import IssueCommitConnection from './models/connections/IssueCommitConnection.ts';
import CommitCommitConnection from './models/connections/CommitCommitConnection.ts';
import CommitModuleConnection from './models/connections/CommitModuleConnection.ts';
import ModuleModuleConnection from './models/connections/ModuleModuleConnection.ts';
import ModuleFileConnection from './models/connections/ModuleFileConnection.ts';
import BranchFileConnection from './models/connections/BranchFileConnection.ts';
import BranchFileFileConnection from './models/connections/BranchFileFileConnection.ts';
import CommitFileStakeholderConnection from './models/connections/CommitFileStakeholderConnection.ts';
import CommitFileConnection from './models/connections/CommitFileConnection.ts';
import CommitBuildConnection from './models/connections/CommitBuildConnection.ts';
import ConfigurationError from './errors/ConfigurationError';
import DatabaseError from './errors/DatabaseError';
import GateWayService from './utils/gateway-service';
import * as projectStructureHelper from './utils/projectStructureHelper';

import getDbExportEndpoint from './endpoints/get-db-export';

import graphQlEndpoint from './endpoints/graphQl';

import * as setupDb from './core/db/setup-db';

import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import express from 'express';
import { FSWatcher } from 'fs-extra';
import vcs from './indexers/vcs';
import its from './indexers/its';
import ci from './indexers/ci';
import Repository from './core/provider/git';
import chalk from 'chalk';

cli.parse(
  (targetPath, options) => {
    console_stamp(console, { format: ':date(yyyy/mm/dd HH:MM:ss)' });
    console.log(`Running binocular with following options on path "${targetPath}":`);
    console.log(options);
    ctx.setOptions(options);
    ctx.setTargetPath(targetPath);
    config.loadConfig(ctx);
    if (options.frontend) {
      runFrontend();
    }
    if (options.backend) {
      runBackend();
    }
  },
  (options) => {
    if (options.runIndexer) {
      projectStructureHelper.deleteDbExport(__dirname + '/../binocular-frontend');
      const indexerOptions = {
        backend: true,
        frontend: false,
        open: false,
        clean: true,
        vcs: true,
        its: true,
        ci: true,
        export: true,
        server: false,
      };
      const targetPath = path.resolve(options.runIndexer ? __dirname + '/../' : options.runIndexer);
      ctx.setOptions(indexerOptions);
      ctx.setTargetPath(targetPath);
      config.loadConfig(ctx);
      runBackend().then(() => {
        buildFrontend(options.buildMode);
      });
    } else {
      buildFrontend(options.buildMode);
    }
  },
);

function runBackend() {
  startTime = Moment.now();
  console.log('Start Time: ' + Moment(startTime).format());

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // set up the endpoints
  ctx.app.get('/api/db-export', (req: express.Request, res: express.Response) => getDbExportEndpoint(req, res, ctx));

  // proxy to the FOXX-service
  ctx.app.get('/graphQl', (req: express.Request, res: express.Response) => graphQlEndpoint(req, res, ctx));
  ctx.app.post('/graphQl', (req: express.Request, res: express.Response) => graphQlEndpoint(req, res, ctx));

  const port = config.get().port;

  const repoWatcher: {
    listener: FSWatcher | null;
    working: boolean;
    headTimestamp: number | null;
    headBranches: { branch: string; sha: string }[];
  } = {
    listener: null,
    working: false,
    headTimestamp: null,
    headBranches: [],
  };
  let indexingProcess = 0;

  let activeIndexingQueue: Promise<void> | Promise<any[]> | null = Promise.resolve();

  interface IndexersType {
    [signature: string]: typeof vcs | typeof its | typeof ci | null;
  }

  const indexers: IndexersType = {
    vcs: null,
    its: null,
    ci: null,
  };

  const services: any[] = [];

  const gatewayService = new GateWayService();
  const reporter = new (ProgressReporter as any)(ctx.io, [
    'commits',
    'issues',
    'builds',
    'files',
    'modules',
    'mergeRequests',
    'milestones',
  ]);
  let databaseConnection: any = null;

  /**
   * init and start database if it has not been started and start indexers
   * @param context get current context
   * @param gateway holds gateway service to handle various remote services
   *
   * @returns {Promise<*>}
   */
  async function startDatabase(context: typeof ctx, gateway: GateWayService) {
    const repository = await Repository.fromPath(ctx.targetPath);

    context.repo = repository;
    config.setSource(repository.pathFromRoot('.binocularrc'));
    // configure everything in the context
    context.db = setupDb.default(config.get().arango);
    if (databaseConnection === null) {
      while (databaseConnection === null) {
        try {
          databaseConnection = await ensureDb(repository, context);
        } catch (error: unknown) {
          if (error instanceof DatabaseError) {
            databaseConnection = null;
            console.error(`A ${error.name} occurred and returns the following message: ${error.message}!`);
            console.log('wait 5 seconds until retry!');
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }

      //writeConfigToFrontend
      projectStructureHelper.writeContextToFrontend(ctx);
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
  async function repoUpdateHandler(repository: Repository, context: typeof ctx, gateway: GateWayService) {
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    repoWatcher.listener = fs.watch(headPath, async (event: fs.WatchEventType, file: string) => {
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
  async function getFetchedBranches(file: string): Promise<{ branch: string; sha: string }[]> {
    if (!fs.existsSync(file)) {
      return [];
    }
    return new Promise((resolve, reject) =>
      fs.readFile(file, 'utf8', (err, content) => {
        if (err) {
          return reject(err);
        } else if (content && content.length > 0) {
          const branchMatcher = /^([^\n\t]*).*?['"]([^\n\t]*)['"].*?$/gm;
          const branches: any[] = [];
          let match;
          while ((match = branchMatcher.exec(content))) {
            if (match.length === 3) {
              branches.push({ branch: match[2], sha: match[1] });
            }
          }
          return resolve(branches);
        }
        return resolve([]);
      }),
    );
  }

  // be sure to re-index when the configuration changes
  config.on('updated', async () => {
    return await startDatabase.bind(this, ctx, gatewayService);
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
  async function reIndex(
    indexers: IndexersType,
    context: typeof ctx,
    reporter: typeof ProgressReporter,
    gateway: GateWayService,
    currentQueuePosition: any,
    indexingThread: number,
  ) {
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
  async function indexing(
    indexers: IndexersType,
    context: typeof ctx,
    reporter: typeof ProgressReporter,
    gateway: GateWayService,
    indexingThread: number,
  ) {
    threadLog(indexingThread, 'Indexing data...');
    gateway.startIndexing();

    try {
      context.vcsUrlProvider = await UrlProvider.getVcsUrlProvider(context.repo, reporter, context, context.clean);
      context.ciUrlProvider = await UrlProvider.getCiUrlProvider(context.repo, reporter, context, context.clean);
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
          }),
      );

      // make sure that the services has not been stopped
      const activeProviders = activeIndexers.filter((provider) => {
        return !provider || !provider.isStopping();
      });

      if (activeProviders.length < 1) {
        threadLog(indexingThread, 'All indexers stopped!');
        return;
      }

      await (Issue as any).deduceStakeholders();
      createManualIssueReferences(config.get('issueReferences'));
      if (context.argv.export) {
        projectStructureHelper.deleteDbExport(__dirname + '/../binocular-frontend');
        projectStructureHelper.createAndFillDbExportFolder(context.db, __dirname + '/../binocular-frontend');
      }

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
      console.log('Execution Time: ' + Math.floor(executionTime / 60) + ':' + (executionTime % 60));
      threadLog(indexingThread, 'Indexing finished');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'Gitlab401Error') {
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
  async function getIndexer(indexers: IndexersType, context: typeof ctx, reporter: typeof ProgressReporter, indexingThread: number) {
    if (!indexers) {
      indexers = {};
    }

    // stores all indexer to call them async
    const indexHandler: any[] = [];
    if (context.argv.vcs) {
      indexHandler.push(
        async () =>
          (indexers.vcs = await GetIndexer.makeVCSIndexer(
            context.repo,
            context.vcsUrlProvider,
            reporter,
            context.argv.clean,
            config,
            context,
          )),
      );
    }

    if (context.argv.its) {
      indexHandler.push(
        optionalIndexerHandler.bind(this, indexingThread, 'its', context.repo, reporter, context, GetIndexer.makeITSIndexer),
      );
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
  async function optionalIndexerHandler(
    indexingThread: number,
    key: string,
    repository: Repository,
    reporter: typeof ProgressReporter,
    context: typeof ctx,
    asyncIndexCreator: any,
  ) {
    try {
      indexers[key] = await asyncIndexCreator(repository, reporter, context, true);
    } catch (error: unknown) {
      if (error instanceof ConfigurationError) {
        threadWarn(
          indexingThread,
          `The following indexer "${key}" failed with "${error.name}" and holds the following message: ${error.message}`,
        );
      } else {
        throw error;
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
  async function stopIndexers(gateway: GateWayService) {
    gateway.stopIndexing();
    await Promise.all(
      _.each(
        _.values(indexers).filter((indexer) => indexer !== null),
        async (indexPromise: any) => {
          const index = await indexPromise;
          if (index) {
            index.stop();
          }
        },
      ),
    );
  }

  /**
   * Ensures that the db is set up correctly and the GraphQL-Service is installed
   * @param repo contains the repository
   * @param context get the current context
   */
  function ensureDb(repo: Repository, context: typeof ctx) {
    return context.db
      .ensureDatabase('binocular-' + repo.getName(), context)
      .catch((e: Error) => {
        throw new DatabaseError(e.message);
      })
      .then(function () {
        if (context.argv.clean) {
          return context.db.truncate();
        }
      })
      .then(() => {
        return Promise.all([
          context.db.ensureService(path.join(__dirname, '../foxx'), '/binocular-ql'),
          Commit.ensureCollection(),
          File.ensureCollection(),
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

  function createManualIssueReferences(issueReferences: any) {
    return Promise.all(
      _.keys(issueReferences).map((sha) => {
        const iid = issueReferences[sha];

        return Promise.all([(Commit as any).findOneBySha(sha), (Issue as any).findOneByIid(iid)]).then(([commit, issue]) => {
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
      }),
    );
  }

  /**
   * catches errors and stops all services gracefully
   *
   * @param serviceEntry contains the actual service entry-point that should be observed
   * @returns {Promise<void>}
   */
  async function serviceStarter(serviceEntry: any) {
    try {
      await serviceEntry();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.trace(error.stack);
      }
      try {
        await stop();
        // eslint-disable-next-line no-empty
      } catch (ignore) {}
    }
  }

  async function connectIssuesAndCommits() {
    const issues = await Issue.findAll();
    const commits = await Commit.findAll();
    //at this point, most issues have a mentions attribute which stores the sha hashes of the commits that mention the issue.
    //connect these commits to the issue:
    for (const issue of issues) {
      if (issue === null) {
        continue;
      }
      //some issues are not mentioned by any commits
      if (!issue.data.mentions) continue;
      for (const mention of issue.data.mentions) {
        const commit = commits.filter((c: any) => c.data.sha === mention.commit);
        if (commit && commit[0]) {
          await IssueCommitConnection.connect({ closes: mention.closes }, { from: issue, to: commit[0] });
        }
      }
    }
    //remove the temporary `mentions` attribute since we have the connections now
    await (Issue as any).deleteMentionsAttribute();
  }

  async function connectCommitsAndBuilds() {
    const builds = await Build.findAll();
    const commits = await Commit.findAll();

    for (const build of builds) {
      if (build === null) {
        continue;
      }
      if (!build.data.sha) continue;
      const commit = commits.filter((c: any) => c.sha === build.data.sha);
      if (commit && commit[0]) {
        await CommitBuildConnection.connect({}, { from: commit[0], to: build });
      }
    }

    await (Build as any).deleteShaRefAttributes();
  }

  // start services
  return Promise.all(
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
      (async (context: typeof ctx, conf: typeof config, gateway: GateWayService) => {
        services.push(gateway);
        await gateway.configure(conf.get('gateway'));
        return gateway.start();
      }).bind(this, ctx, config, gatewayService),
    ].map((entryPoint) => serviceStarter(entryPoint)),
  ).then(() => {
    // if no-server flag set stop immediately after indexing
    if (!ctx.argv.server) {
      stop();
    }
  });
}

function runFrontend() {
  const fronted = spawn('npm run dev:frontend', [], { shell: true, cwd: __dirname + '/..' });
  fronted.stdout.on('data', (data) => {
    console.log(chalk.cyan(`${data}`));
  });
  fronted.stderr.on('data', (data) => {
    console.error(chalk.blue(`${data}`));
  });
  fronted.on('close', (code) => {
    console.log(chalk.blueBright(`frontend process exited with code ${code}`));
  });
}

function buildFrontend(mode: string) {
  const fronted = spawn(`npm run build:${mode}`, [], { shell: true, cwd: __dirname + '/..' });
  fronted.stdout.on('data', (data) => {
    console.log(chalk.cyan(`${data}`));
  });
  fronted.stderr.on('data', (data) => {
    console.error(chalk.blue(`${data}`));
  });
  fronted.on('close', (code) => {
    console.log(chalk.blueBright(`build process exited with code ${code}`));
  });
}
