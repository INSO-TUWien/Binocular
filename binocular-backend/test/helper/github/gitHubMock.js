'use strict';

import { issuesWithEvents, pipelineJobs, pipelines, pullRequestsWithEvents, users } from './gitHubTestData';

class GitHubMock {
  constructor() {
    this.pipelineId = 0;
  }

  loadAssignableUsers() {}

  getPipelines() {
    return new Promise((resolve) => {
      resolve(pipelines);
    });
  }

  getPipeline() {
    this.pipelineId++;
    return new Promise((resolve) => {
      resolve({
        id: '' + (this.pipelineId - 1),
        head_sha: '1234567890',
        head_commit: { id: 0, sha: '1234567890', committed_at: '1970-01-01T07:00:00.000Z', timestamp: '1970-01-01T07:00:00.000Z' },
        conclusion: 'success',
        display_title: 'test',
        run_number: 0,
        created_at: '1970-01-01T07:00:00.000Z',
        started_at: '1970-01-01T07:00:00.000Z',
        updated_at: '1970-01-01T07:00:00.000Z',
        run_started_at: '1970-01-01T07:00:00.000Z',
        actor: { login: 'tester1' },
      });
    });
  }

  getPipelineJobs() {
    return pipelineJobs;
  }

  getIssuesWithEvents() {
    return new Promise((resolve) => {
      resolve(issuesWithEvents);
    });
  }

  getPullRequestsWithEvents() {
    return new Promise((resolve) => {
      resolve(pullRequestsWithEvents);
    });
  }

  getUser(login) {
    const res = users.filter((u) => u.login === login)[0];
    if (res === undefined) {
      return { name: null };
    }
    return res;
  }
}

export default GitHubMock;
