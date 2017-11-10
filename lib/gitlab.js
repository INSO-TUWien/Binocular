'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const urlJoin = require('url-join');
const log = require('debug')('gitlab');
const Paginator = require('./paginator.js');

function GitLab(options) {
  this.baseUrl = options.baseUrl;
  this.privateToken = options.privateToken;
  this.requestTimeout = options.requestTimeout;
}

GitLab.prototype.getProject = function(projectId) {
  log('getProject(%o)', projectId);
  return this.request(`/projects/${projectId}`).then(resp => resp.body);
};

GitLab.prototype.getIssues = function(projectId) {
  log('getIssues(%o)', projectId);
  return this.paginatedRequest(`/projects/${projectId}/issues`);
};

GitLab.prototype.getNotes = function(projectId, issueId) {
  log('getNotes(%o, %o)', projectId, issueId);
  return this.paginatedRequest(`/projects/${projectId}/issues/${issueId}/notes`);
};

GitLab.prototype.getPipelines = function(projectId) {
  log('getPipelines(%o)', projectId);
  return this.paginatedRequest(`/projects/${projectId}/pipelines`);
};

GitLab.prototype.getPipeline = function(projectId, pipelineId) {
  log('getPipeline(%o, %o)', projectId, pipelineId);
  return this.request(`/projects/${projectId}/pipelines/${pipelineId}`).then(resp => resp.body);
};

GitLab.prototype.request = function(path, options) {
  const rpOptions = _.defaults(
    {
      uri: urlJoin(this.baseUrl, path),
      json: true,
      headers: {
        'PRIVATE-TOKEN': this.privateToken
      },
      resolveWithFullResponse: true,
      timeout: this.requestTimeout || 3000
    },
    options
  );

  return rp(rpOptions);
};

GitLab.prototype.paginatedRequest = function(path, options) {
  options = _.defaults({}, options);
  return new Paginator(
    (page, per_page) =>
      this.request(path, {
        qs: _.defaults({ page, per_page }, options.qs)
      }),
    resp => resp.body,
    resp => parseInt(resp.headers['x-total'], 10)
  );
};

module.exports = GitLab;
