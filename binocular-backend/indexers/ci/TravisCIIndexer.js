'use strict';

import Build from '../../models/models/Build';
import FindFiles from 'file-regex';
import * as UrlProvider from '../../url-providers/index';
import TravisCI from '../../core/provider/travis-ci';
import ConfigurationError from '../../errors/ConfigurationError';
import CIIndexer from './CIIndexer';
import moment from 'moment';
import { Octokit } from '@octokit/rest';
import debug from 'debug';

const log = debug('importer:travis-ci-indexer');

class TravisCIIndexer {
  constructor(repository, progressReporter) {
    this.repo = repository;
    this.reporter = progressReporter;
    this.stopping = false;
  }

  async configure(config) {
    this.source = await FindFiles(await this.repo.getRoot(), /.travis\.ya?ml$/);
    this.urlProvider = await UrlProvider.getCiUrlProvider(this.repo, this.reporter);

    this.github = new Octokit({
      baseUrl: 'https://api.github.com',
      auth: config?.auth?.token,
    });

    //prerequisites to permit the use of travis
    if (!this.urlProvider || !config) {
      throw new ConfigurationError('Travis-CI cannot be configured!');
    }

    const currentBranch = await this.repo.getCurrentBranch();

    log(`fetching branch data from ${currentBranch}[${currentBranch}]`);
    const tokens = config.token || {};
    this.controller = new TravisCI({
      baseUrl: this.urlProvider.getApiUrl(),
      tokens,
      requestTimeout: config.timeout,
      branch: currentBranch,
    });

    this.indexer = new CIIndexer(this.reporter, this.controller, await this.urlProvider.getProjectName(), async (pipeline, jobs) => {
      jobs = jobs || [];
      log(
        `create build ${JSON.stringify({
          id: pipeline.id,
          number: pipeline.number,
          sha: pipeline.commit.sha,
          status: convertState(pipeline.state),
          updatedAt: moment(pipeline.updated_at).toISOString(),
          startedAt: moment(pipeline.started_at).toISOString(),
          finishedAt: moment(pipeline.finished_at).toISOString(),
          committedAt: moment(pipeline.commit.committed_at).toISOString(),
        })}`,
      );
      const username = (pipeline.created_by || {}).login;
      const userFullName = username !== undefined ? (await this.github.users.getByUsername({ username: username })).data.name : '';
      return Build.persist({
        id: pipeline.id,
        sha: pipeline.commit.sha,
        ref: pipeline.commit.ref,
        status: pipeline.state,
        tag: pipeline.tag,
        user: username,
        userFullName: userFullName,
        createdAt: moment(pipeline.created_at || (jobs.length > 0 ? jobs[0].created_at : pipeline.started_at)).toISOString(),
        updatedAt: moment(pipeline.updated_at).toISOString(),
        startedAt: moment(pipeline.started_at).toISOString(),
        finishedAt: moment(pipeline.finished_at).toISOString(),
        committedAt: moment(pipeline.commit.committed_at).toISOString(),
        duration: pipeline.duration,
        jobs: jobs.map((job) => ({
          id: job.id,
          name: username,
          status: job.state,
          stage: job.stage,
          createdAt: moment(job.created_at).toISOString(),
          finishedAt: moment(job.finished_at).toISOString(),
          webUrl: this.urlProvider.getJobUrl(job.id),
        })),
        webUrl: this.urlProvider.getPipelineUrl(pipeline.id),
      });
    });
  }

  async index() {
    try {
      return await this.indexer.index();
    } catch (e) {
      console.log('Travis Indexer Failed! - ' + e.message);
    }
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    if (this.indexer && !this.indexer.isStopping()) {
      this.indexer.stop();
    }

    if (this.controller && !this.controller.isStopping()) {
      this.controller.stop();
    }
    this.stopping = true;
  }
}

const convertState = (state) => {
  switch (state) {
    case 'passed':
      return 'success';
    default:
      return state;
  }
};

export default TravisCIIndexer;
