export const assignableUsers = [];

export const pipelines = [
  { id: '0', conclusion: 'success', head_commit: { sha: '' } },
  { id: '1', conclusion: 'success', head_commit: { sha: '' } },
  { id: '2', conclusion: 'success', head_commit: { sha: '' } },
];

export const pipelineJobs = [
  { id: '0', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
  { id: '1', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
  { id: '2', conclusion: 'failure', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
];

export const issuesWithEvents = [
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
];

export const pullRequestsWithEvents = [
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
];

export const users = [
  {
    login: 'tester1',
    email: 'tester1@testmail.com',
    name: 'Tester1',
    url: 'url',
    avatarUrl: 'url',
  },
  {
    login: 'tester2',
    email: 'tester2@testmail.com',
    name: 'Tester2',
    url: 'url',
    avatarUrl: 'url',
  },
];
