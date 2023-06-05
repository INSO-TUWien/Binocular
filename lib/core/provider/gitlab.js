'use strict';

const _ = require('lodash');
const fetch = require('node-fetch');
const urlJoin = require('url-join');
const log = require('debug')('gitlab');
const Paginator = require('../../paginator.js');
const { response } = require('express');

class GitLab {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.privateToken = options.privateToken;
    this.requestTimeout = options.requestTimeout;
    this.count = 0;
    this.stopping = false;
  }

  getProject(projectId) {
    log('getProject(%o)', projectId);
    return this.request(`/projects/${projectId}`).then((resp) => {
      return resp;
    });
  }

  getIssues(projectId) {
    log('getIssues(%o)', projectId);
    return this.paginatedRequest(`/projects/${projectId}/issues`);
  }

  getNotes(projectId, issueId) {
    log('getNotes(%o, %o)', projectId, issueId);
    return this.paginatedRequest(`/projects/${projectId}/issues/${issueId}/notes`);
  }

  getPipelines(projectId) {
    log('getPipelines(%o)', projectId);
    return this.paginatedRequest(`/projects/${projectId}/pipelines`);
  }

  getPipeline(projectId, pipelineId) {
    log('getPipeline(%o, %o)', projectId, pipelineId);
    return this.request(`/projects/${projectId}/pipelines/${pipelineId}`).then((resp) => resp);
  }

  getPipelineJobs(projectId, pipelineId) {
    log('getPipelineJobs(%o,%o)', projectId, pipelineId);
    return this.request(`/projects/${projectId}/pipelines/${pipelineId}/jobs`).then((resp) => resp);
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }

  async request(path, options) {
    const rpOptions = _.defaults(
      {
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': this.privateToken,
        },
        resolveWithFullResponse: true,
        timeout: this.requestTimeout || 3000,
      },
      options
    );
    return fetch(urlJoin(this.baseUrl, path), rpOptions).then((response) => {
      return response.json().then((data) => {
        return data;
      });
    });
  }

  paginatedRequest(path, options) {
    options = _.defaults({}, options);
    return new Paginator(
      (page, per_page) => {
        if (this.stopping) {
          return Promise.resolve([]);
        }
        return this.request(path, {
          qs: _.defaults({ page, per_page }, options.qs),
        });
      },
      (resp) => {
        return resp;
      },
      (resp) => (this.count = parseInt(resp.length, 10))
    );
  }
}

module.exports = GitLab;
