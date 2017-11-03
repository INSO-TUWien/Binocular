'use strict';

const _ = require('lodash');
const rp = require('request-promise');
const urlJoin = require('url-join');
const Rx = require('rxjs');
const log = require('debug')('gitlab');

function GitLab(options) {
  this.baseUrl = options.baseUrl;
  this.privateToken = options.privateToken;
  this.requestTimeout = options.requestTimeout;
}

GitLab.prototype.getProject = function(project) {
  log('Getting project');
  return this.request(`/projects/${project}`);
};

GitLab.prototype.issues = function(project) {
  log('Getting issues');
  return Rx.Observable.create(obs => {
    this.request(`/projects/${project}/issues`).then(resp => {
      console.log('resp.headers', resp.headers);
    });
  });
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

  return rp(rpOptions).then(function(resp) {
    console.log('response:', resp.body);
    return resp.body;
  });
};

module.exports = GitLab;
