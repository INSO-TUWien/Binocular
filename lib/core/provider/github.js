'use strict';

const _ = require('lodash');
const urlJoin = require('url-join');
const log = require('debug')('github');
const Paginator = require('../../paginator.js');
const { response } = require('express');
const { Octokit } = require('@octokit/rest');

class GitHub {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.privateToken = options.privateToken;
    this.requestTimeout = options.requestTimeout;
    this.count = 0;
    this.stopping = false;
    this.github = new Octokit({
      baseUrl: 'https://api.github.com',
      auth: this.privateToken,
    });
  }

  getPipelines(projectId) {
    console.log('get Runs for ' + projectId);
    log('getPipelines(%o)', projectId);
    return this.paginatedRequest((page) => {
      return this.github.rest.actions.listWorkflowRunsForRepo({
        owner: projectId.split('/')[0],
        repo: projectId.split('/')[1],
        page: page,
      });
    });
  }

  getPipeline(projectId, pipelineId) {
    log('getPipeline(%o, %o)', projectId, pipelineId);
    return this.github.rest.actions
      .getWorkflowRun({
        owner: projectId.split('/')[0],
        repo: projectId.split('/')[1],
        run_id: pipelineId,
      })
      .then((workflowRun) => {
        return workflowRun.data;
      });
  }

  getPipelineJobs(projectId, pipelineId) {
    log('getPipelineJobs(%o,%o)', projectId, pipelineId);
    return this.github.rest.actions
      .listJobsForWorkflowRun({
        owner: projectId.split('/')[0],
        repo: projectId.split('/')[1],
        run_id: pipelineId,
      })
      .then((jobs) => {
        return jobs.data.jobs;
      });
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }

  paginatedRequest(rq) {
    return new Paginator(
      (page, per_page) => {
        if (this.stopping) {
          return Promise.resolve({
            data: {
              workflow_runs: [],
            },
          });
        }
        return rq(page);
      },
      (resp) => {
        return resp.data.workflow_runs || [];
      },
      (resp) => {
        return (this.count = parseInt(resp.data.total_count, 10));
      }
    );
  }
}

module.exports = GitHub;
