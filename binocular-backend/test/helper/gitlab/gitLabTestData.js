export const testProject = { id: 1, path_with_namespace: 'Test/Test-Project' };

export const testAcc = {
  username: 'test',
  name: 'Testy McTest',
  avatar_url: 'url',
  web_url: 'url',
};

export const testTimestamp = '1970-01-01T07:00:00.000Z';

export const testMilestone = {
  id: '1',
  iid: 1,
  title: 'test milestone',
  description: 'desc',
  createdAt: testTimestamp,
  updatedAt: testTimestamp,
  startDate: testTimestamp,
  dueDate: testTimestamp,
  state: 'closed',
  expired: true,
  webUrl: 'url',
};

export const testMilestones = [testMilestone];

export const testIssues = [
  {
    id: 0,
    iid: 1001,
    updated_at: testTimestamp,
    author: testAcc,
    assignee: testAcc,
    assignees: [testAcc],
    milestone: testMilestone,
  },
  {
    id: 1,
    iid: 1002,
    updated_at: testTimestamp,
    author: testAcc,
    assignee: testAcc,
    assignees: [testAcc],
    milestone: testMilestone,
  },
  {
    id: 2,
    iid: 1003,
    updated_at: testTimestamp,
    author: testAcc,
    assignee: testAcc,
    assignees: [testAcc],
    milestone: testMilestone,
  },
];

export const testNotes = [
  {
    id: 0,
    created_at: testTimestamp,
    updatedAt: testTimestamp,
    system: false,
    resolvable: false,
    confidential: false,
    internal: false,
    author: testAcc,
    body: 'closed',
  },
  {
    id: 1,
    created_at: testTimestamp,
    updatedAt: testTimestamp,
    system: false,
    resolvable: false,
    confidential: false,
    internal: false,
    author: testAcc,
    body: 'mentioned in commit 1234567890',
  },
  {
    id: 2,
    created_at: testTimestamp,
    updatedAt: testTimestamp,
    system: false,
    resolvable: false,
    confidential: false,
    internal: false,
    author: testAcc,
    body: 'some text',
  },
];

export const testPipelines = [
  {
    id: '0',
    status: 'SUCCESS',
    user: { name: 'Tester1' },

    jobs: {
      edges: [
        { node: { id: '0', stage: { name: '' } } },
        { node: { id: '1', stage: { name: '' } } },
        { node: { id: '2', stage: { name: '' } } },
      ],
    },
  },
  {
    id: '1',
    status: 'SUCCESS',
    user: { name: 'Tester1' },
    jobs: {
      edges: [
        { node: { id: '0', stage: { name: '' } } },
        { node: { id: '1', stage: { name: '' } } },
        { node: { id: '2', stage: { name: '' } } },
      ],
    },
  },
  {
    id: '2',
    status: 'SUCCESS',
    user: { name: 'Tester1' },

    jobs: {
      edges: [
        { node: { id: '0', stage: { name: '' } } },
        { node: { id: '1', stage: { name: '' } } },
        { node: { id: '2', stage: { name: '' } } },
      ],
    },
  },
];

export const testMergeRequests = [
  { id: 1, iid: 1, author: testAcc, assignee: testAcc, assignees: [testAcc], milestone: testMilestone },
  { id: 2, iid: 2, author: testAcc, assignee: testAcc, assignees: [testAcc], milestone: testMilestone },
  { id: 3, iid: 3, author: testAcc, assignee: testAcc, assignees: [testAcc], milestone: testMilestone },
];

export const testMergeRequestNotes = [
  {
    id: 0,
    created_at: testTimestamp,
    updatedAt: testTimestamp,
    system: false,
    resolvable: false,
    confidential: false,
    internal: false,
    author: testAcc,
    body: 'closed',
  },
  {
    id: 1,
    created_at: testTimestamp,
    updatedAt: testTimestamp,
    system: false,
    resolvable: false,
    confidential: false,
    internal: false,
    author: testAcc,
    body: 'mentioned in commit 1234567890',
  },
  {
    id: 2,
    created_at: testTimestamp,
    updatedAt: testTimestamp,
    system: false,
    resolvable: false,
    confidential: false,
    internal: false,
    author: testAcc,
    body: 'some text',
  },
];
