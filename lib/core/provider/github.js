'use strict';

import debug from 'debug';
import Paginator from '../../utils/paginator';
import { Octokit } from '@octokit/rest';
import { Octokit as OctokitCore } from '@octokit/core';
import { paginateGraphql } from '@octokit/plugin-paginate-graphql';

const log = debug('github');

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
    const PaginatedGraphQL = OctokitCore.plugin(paginateGraphql);
    this.graphqlWithAuth = new PaginatedGraphQL({ auth: this.privateToken });
    this.users = {};
  }

  async loadAssignableUsers(owner, name) {
    const { repository } = await this.graphqlWithAuth.graphql.paginate(
      `query paginate($cursor: String) {
         repository(owner: "${owner}", name: "${name}") {
          name,
          assignableUsers(first: 100, after:$cursor) {
            nodes {
              login
              email
              name
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
      `
    );
    repository.assignableUsers.nodes.forEach((user) => {
      this.users[user.login] = user;
    });
  }

  getUser(login) {
    if (this.users[login] !== undefined) {
      return this.users[login];
    } else {
      return { name: null };
    }
  }

  getPipelines(projectId) {
    log('getPipelines(%o)', projectId);
    return this.paginatedRequest((page) => {
      return this.github.rest.actions.listWorkflowRunsForRepo({
        owner: projectId.split('/')[0],
        repo: projectId.split('/')[1],
        page: page,
      });
    })
      .each((resp) => resp)
      .then((resp) => Promise.all(resp))
      .then((resp) => resp.map((elem) => elem[0]));
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

export default GitHub;
