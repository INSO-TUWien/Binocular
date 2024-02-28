'use strict';

import _ from 'lodash';
import fetch from 'node-fetch';
import urlJoin from 'url-join';
import debug from 'debug';
import Paginator from '../../utils/paginator';
import { GraphQLClient, gql } from 'graphql-request';

const log = debug('gitlab');

class GitLab {
  constructor(options) {
    this.baseUrl = urlJoin(options.baseUrl, 'v4');
    this.privateToken = options.privateToken;
    this.requestTimeout = options.requestTimeout;
    this.count = 0;
    this.stopping = false;
    this.graphQL = new GraphQLClient(urlJoin(options.baseUrl, 'graphql'), {
      headers: {
        authorization: `Bearer ${options.privateToken}`,
      },
    });
  }

  getProject(projectId) {
    log('getProject(%o)', projectId);
    return this.request(`/projects/${projectId}`).then((resp) => {
      return resp.body;
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
    return this.graphQL
      .request(
        gql`
      {
        project(fullPath: "${projectId.replaceAll('%2F', '/')}") {
          name
          pipelines {
            edges {
              node {
                id
                iid
                project {
                  id
                  webUrl
                }
                path
                sha
                ref
                status
                createdAt
                updatedAt
                beforeSha
                user {
                  id
                  username
                  name
                  state
                  avatarUrl
                  webUrl
                }
                jobs {
                  edges {
                    node {
                      id
                      name
                      createdAt
                      finishedAt
                      status
                      stage {
                        name
                      }
                    }
                  }
                }
                startedAt
                finishedAt
                duration
                queuedDuration
                detailedStatus {
                  id
                  icon
                  text
                  label
                  group
                  tooltip
                  hasDetails
                  detailsPath
                  favicon
                }
              }
            }
          }
        }
      }
    `,
      )
      .then((response) => response.project.pipelines.edges.map((pipeline) => pipeline.node));
    //return this.paginatedRequest(`/projects/${projectId}/pipelines`);
  }

  getMileStones(projectId) {
    log('getMilestones(%o)', projectId);
    return this.paginatedRequest(`/projects/${projectId}/milestones`);
  }

  getPipelineJobs() {
    return 'gitlab';
  }

  getMergeRequests(projectId) {
    log('getMergeRequests(%o)', projectId);
    return this.paginatedRequest(`/projects/${projectId}/merge_requests?scope=all`);
  }

  getMergeRequestNotes(projectId, issueId) {
    log('getMergeRequestNotes(%o, %o)', projectId, issueId);
    return this.paginatedRequest(`/projects/${projectId}/merge_requests/${issueId}/notes`);
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
      options,
    );
    return fetch(urlJoin(this.baseUrl, path), rpOptions).then((response) => {
      return response.json().then((data) => {
        return { headers: response.headers, body: data };
      });
    });
  }

  paginatedRequest(path, options) {
    options = _.defaults({}, options);
    return new Paginator(
      (page) => {
        if (this.stopping) {
          return Promise.resolve([]);
        }
        return this.request(path + '?page=' + page, {
          qs: options.qs,
        });
      },
      (resp) => {
        return resp.body;
      },
      (resp) => {
        return (this.count = parseInt(resp.headers.get('x-total'), 10));
      },
    );
  }
}

export default GitLab;
