// test data for github mock API (./gitHubMock.ts)
// if you need the mock API to return different data, add (and export) it here
// and use the remapGitHubApiCall() function from ../utils.ts in your tests

export const assignableUsers = [];

export const pipelinesVersion0 = [
  { id: 0, conclusion: 'success', head_commit: { sha: '' }, updated_at: '1970-01-01T07:00:00.000Z' },
  { id: 1, conclusion: 'success', head_commit: { sha: '' }, updated_at: '1970-01-01T07:00:00.000Z' },
  { id: 2, conclusion: 'success', head_commit: { sha: '' }, updated_at: '1970-01-01T07:00:00.000Z' },
];

export const pipelinesVersion1 = [
  { id: 0, conclusion: 'success', head_commit: { sha: '' }, updated_at: '1970-02-01T07:00:00.000Z' },
  { id: 1, conclusion: 'success', head_commit: { sha: '' }, updated_at: '1970-01-01T07:00:00.000Z' },
  { id: 2, conclusion: 'success', head_commit: { sha: '' }, updated_at: '1970-01-01T07:00:00.000Z' },
];

export const singlePipeline = { id: 3, conclusion: 'success', head_commit: { sha: '' }, updated_at: '1970-01-01T07:00:00.000Z' };

export const pipelineJobsVersion0 = [
  { id: '0', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
  { id: '1', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
  { id: '2', conclusion: 'failure', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
];

export const pipelineJobsVersion1 = [
  { id: '0', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
  { id: '1', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
  { id: '2', conclusion: 'failure', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
  { id: '3', conclusion: 'failure', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
];

export const singlePipelineJob = [
  { id: '4', conclusion: 'success', created_at: '1970-01-01T07:00:00.000Z', completed_at: '1970-01-01T07:00:00.000Z' },
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
    closingIssuesReferences: { nodes: [{ id: '0' }] },
    commits: { nodes: [{ commit: { oid: '1234567890' } }] },
    mergeCommit: { oid: '1234567890' },
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
    closingIssuesReferences: { nodes: [] },
    commits: { nodes: [] },
    mergeCommit: null,
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
