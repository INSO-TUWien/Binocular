'use strict';

class GitHubMock {
  constructor() {
    this.pipelineId = 0;
  }

  loadAssignableUsers() {
    return [];
  }

  getPipelines() {
    return new Promise((resolve) => {
      resolve([
        { id: '0', conclusion: 'success', head_commit: { sha: '' } },
        { id: '1', conclusion: 'success', head_commit: { sha: '' } },
        { id: '2', conclusion: 'success', head_commit: { sha: '' } },
      ]);
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
    return [
      { id: '0', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
      { id: '1', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
      { id: '2', conclusion: 'failure', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
    ];
  }

  getIssuesWithEvents() {
    return new Promise((resolve) => {
      resolve([
        {
          id: '0',
          iid: 0,
          number: 0,
          title: 'test issue 1',
          body: 'test',
          state: 'closed',
          url: 'https://github.com/Test/Test-Project.git',
          closedAt: '1970-01-01T07:00:00.000Z',
          createdAt: '1970-01-01T07:00:00.000Z',
          updatedAt: '1970-01-01T07:00:00.000Z',
          labels: { nodes: [] },
          milestone: null,
          author: { login: 'tester1' },
          assignees: { nodes: [{ login: 'tester2' }] },
          timelineItems: {
            nodes: [
              {
                commit: { oid: '1234567890' },
                createdAt: '1970-01-01T07:00:00.000Z',
              },
              {
                createdAt: '1970-01-01T07:00:00.000Z',
              },
            ],
          },
        },
        {
          id: '1',
          iid: 1,
          number: 1,
          title: 'test issue 2',
          body: 'test',
          state: 'closed',
          url: 'https://github.com/Test/Test-Project.git',
          closedAt: '1970-01-01T07:00:00.000Z',
          createdAt: '1970-01-01T07:00:00.000Z',
          updatedAt: '1970-01-01T07:00:00.000Z',
          labels: { nodes: [] },
          milestone: null,
          author: { login: 'tester2' },
          assignees: { nodes: [{ login: 'tester1' }, { login: 'tester2' }] },
          timelineItems: {
            nodes: [
              {
                commit: { oid: '1234567890' },
                createdAt: '1970-01-01T07:00:00.000Z',
              },
              {
                createdAt: '1970-01-01T07:00:00.000Z',
              },
            ],
          },
        },
      ]);
    });
  }

  getPullRequestsWithEvents() {
    return new Promise((resolve) => {
      resolve([
        {
          id: '0',
          iid: 0,
          number: 0,
          title: 'test issue 1',
          body: 'test',
          state: 'closed',
          url: 'https://github.com/Test/Test-Project.git',
          closedAt: '1970-01-01T07:00:00.000Z',
          createdAt: '1970-01-01T07:00:00.000Z',
          updatedAt: '1970-01-01T07:00:00.000Z',
          labels: { nodes: [] },
          milestone: null,
          author: { login: 'tester1' },
          assignees: { nodes: [{ login: 'tester2' }] },
          timelineItems: {
            nodes: [
              {
                commit: { oid: '1234567890' },
                createdAt: '1970-01-01T07:00:00.000Z',
              },
              {
                createdAt: '1970-01-01T07:00:00.000Z',
              },
            ],
          },
        },
        {
          id: '1',
          iid: 1,
          number: 1,
          title: 'test issue 2',
          body: 'test',
          state: 'closed',
          url: 'https://github.com/Test/Test-Project.git',
          closedAt: '1970-01-01T07:00:00.000Z',
          createdAt: '1970-01-01T07:00:00.000Z',
          updatedAt: '1970-01-01T07:00:00.000Z',
          labels: { nodes: [] },
          milestone: null,
          author: { login: 'tester2' },
          assignees: { nodes: [{ login: 'tester1' }, { login: 'tester2' }] },
          timelineItems: {
            nodes: [
              {
                commit: { oid: '1234567890' },
                createdAt: '1970-01-01T07:00:00.000Z',
              },
              {
                createdAt: '1970-01-01T07:00:00.000Z',
              },
            ],
          },
        },
      ]);
    });
  }

  getUser() {
    return { name: 'Tester' };
  }
}

export default GitHubMock;
