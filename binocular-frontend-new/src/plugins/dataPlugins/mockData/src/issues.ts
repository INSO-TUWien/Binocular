import { DataPluginIssue, DataPluginIssues } from '../../../interfaces/dataPluginInterfaces/dataPluginIssue.ts';

export default class Issues implements DataPluginIssues {
  constructor() {}

  // this mock data is far from complete and could be more useful
  public async getAll(from: string, to: string) {
    console.log(`Getting Issues from ${from} to ${to}`);
    return new Promise<DataPluginIssue[]>((resolve) => {
      const issues: DataPluginIssue[] = [
        {
          id: '001',
          iid: 1,
          title: 'Task 1',
          state: 'CLOSED',
          webUrl: 'https://example.com/issue/1',
          createdAt: '2024-02-15T10:34:12Z',
          closedAt: '2024-03-10T15:12:45Z',
          notes: [],
          author: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '002',
          iid: 2,
          title: 'Task 2',
          state: 'OPEN',
          webUrl: 'https://example.com/issue/2',
          createdAt: '2024-05-20T09:11:00Z',
          closedAt: null,
          notes: [],
          author: {
            id: '2',
            name: 'Tester 2',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: null,
          assignees: [],
        },
        {
          id: '003',
          iid: 3,
          title: 'Task 3',
          state: 'CLOSED',
          webUrl: 'https://example.com/issue/3',
          createdAt: '2024-06-11T08:22:45Z',
          closedAt: '2024-07-01T12:13:37Z',
          notes: [],
          author: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '004',
          iid: 4,
          title: 'Task 4',
          state: 'CLOSED',
          webUrl: 'https://example.com/issue/4',
          createdAt: '2024-07-15T14:02:11Z',
          closedAt: '2024-08-10T16:45:30Z',
          notes: [],
          author: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '005',
          iid: 5,
          title: 'Task 5',
          state: 'CLOSED',
          webUrl: 'https://example.com/issue/5',
          createdAt: '2024-09-01T11:32:59Z',
          closedAt: '2024-10-04T10:11:18Z',
          notes: [],
          author: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '006',
          iid: 6,
          title: 'Task 6',
          state: 'CLOSED',
          webUrl: 'https://example.com/issue/6',
          createdAt: '2024-10-10T12:10:10Z',
          closedAt: '2024-11-01T18:33:12Z',
          notes: [],
          author: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '2',
            name: 'Tester 2',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '007',
          iid: 7,
          title: 'Task 7',
          state: 'OPEN',
          webUrl: 'https://example.com/issue/7',
          createdAt: '2025-01-05T08:45:30Z',
          closedAt: null,
          notes: [],
          author: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '008',
          iid: 8,
          title: 'Task 8',
          state: 'CLOSED',
          webUrl: 'https://example.com/issue/8',
          createdAt: '2024-12-03T09:55:20Z',
          closedAt: '2025-01-01T11:42:15Z',
          notes: [],
          author: {
            id: '2',
            name: 'Tester 2',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '2',
            name: 'Tester 2',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '009',
          iid: 9,
          title: 'Task 9',
          state: 'OPEN',
          webUrl: 'https://example.com/issue/9',
          createdAt: '2025-02-21T15:12:47Z',
          closedAt: null,
          notes: [],
          author: {
            id: '2',
            name: 'Tester 2',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '2',
            name: 'Tester 2',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
        {
          id: '010',
          iid: 10,
          title: 'Task 10',
          state: 'CLOSED',
          webUrl: 'https://example.com/issue/10',
          createdAt: '2025-03-03T13:18:28Z',
          closedAt: '2025-03-21T10:10:00Z',
          notes: [],
          author: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignee: {
            id: '1',
            name: 'Tester 1',
            user: {
              id: '2',
              gitSignature: 'tester2@github.com',
            },
          },
          assignees: [
            {
              id: '1',
              name: 'Tester 1',
              user: {
                id: '1',
                gitSignature: 'tester@github.com',
              },
            },
          ],
        },
      ];
      resolve(issues);
    });
  }
}
