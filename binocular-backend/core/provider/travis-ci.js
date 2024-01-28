'use strict';

import _ from 'lodash';
import urlJoin from 'url-join';
import fetch from 'node-fetch';
import Paginator from '../../utils/paginator';
import { escape as escapeUtils } from 'querystring';
import debug from 'debug';

const log = debug('travis-ci');

class TravisCI {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.tokens = options.tokens;
    this.requestTimeout = options.requestTimeout;
    this.currentBranch = options.branch;
    this.count = 0;
    this.stopping = false;
  }

  getProject(projectId) {
    log('getProject(%o)', projectId);
    return this.request(`/repo/${escapeUtils(projectId)}`).then((resp) => resp.body);
  }

  getNotes(projectId, issueId) {
    log('getNotes(%o, %o)', projectId, issueId);
    return this.paginatedRequest(`/repo/${escapeUtils(projectId)}/request/${issueId}/messages`);
  }

  getPipelines(projectId) {
    log('getPipelines(%o)', projectId);
    return this.paginatedRequest(`/repo/${escapeUtils(projectId)}/builds`, {
      qs: {
        branch: {
          name: this.currentBranch,
        },
      },
    });
  }

  getPipeline(projectId, pipelineId) {
    log('getPipeline(%o, %o)', projectId, pipelineId);
    return this.request(`/build/${pipelineId}`).then((resp) => resp.body);
  }

  getPipelineJobs(projectId, pipelineId) {
    log('getPipelineJobs(%o,%o)', projectId, pipelineId);
    return this.request(`/build/${pipelineId}/jobs`).then((resp) => resp.body.jobs || []);
  }

  isStopping() {
    return this.stopping;
  }

  stop() {
    this.stopping = true;
  }

  request(path, options) {
    const header = {
      'Content-Type': 'application/json',
      'Travis-API-Version': 3,
    };

    if (this.tokens.access) {
      header.Authorization = `token ${this.tokens.access}`;
    }

    const query = {};

    if (this.tokens.travis) {
      query.token = this.tokens.travis;
    }

    const rpOptions = _.defaults(
      {
        headers: header,
        resolveWithFullResponse: true,
        timeout: this.requestTimeout || 3000,
        auth: _.defaults(query, (options || {}).qs),
      },
      options,
    );
    return fetch(urlJoin(this.baseUrl, path), {
      rpOptions,
    }).then((response) => {
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
          return Promise.resolve({
            body: _.merge(
              {
                '@pagination': {
                  count: this.count,
                },
              },
              { builds: [] },
            ),
          });
        }
        return this.request(path, {
          qs: _.defaults({ offset: (page - 1) * per_page, limit: per_page }, (options || {}).qs),
        });
      },
      (resp) => {
        return resp.body !== undefined ? resp.body.builds || [] : [];
      },
      (resp) => (this.count = parseInt(resp.body['@pagination'].count, 10)),
    );
  }
}

export default TravisCI;
