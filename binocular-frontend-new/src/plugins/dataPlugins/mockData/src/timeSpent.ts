import { DataPluginTimeSpent, DataPluginTimeSpents } from '../../../interfaces/dataPluginInterfaces/dataPluginTimeSpent.ts';

export default class TimeSpent implements DataPluginTimeSpents {
  constructor() {}

  public async getAll(from: string, to: string) {
    console.log(`Getting TimeSpents from ${from} to ${to}`);
    return new Promise<DataPluginTimeSpent[]>((resolve) => {
      const timeSpents: DataPluginTimeSpent[] = [
        {
          title: 'Issue #1: Database Migration',
          notes: [
            {
              createdAt: '2025-02-01T08:00:00Z',
              updatedAt: '2025-02-01T08:00:00Z',
              body: 'added 2h of time spent',
            },
            {
              createdAt: '2025-02-02T09:15:00Z',
              updatedAt: '2025-02-02T09:15:00Z',
              body: 'removed 30m of time spent',
            },
          ],
          creator: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
        },
        {
          title: 'Issue #2: Frontend Layout Fix',
          notes: [
            {
              createdAt: '2025-02-03T10:10:00Z',
              updatedAt: '2025-02-03T10:10:00Z',
              body: 'added 1h of time spent',
            },
            {
              createdAt: '2025-02-03T11:30:00Z',
              updatedAt: '2025-02-03T11:30:00Z',
              body: 'added 30m of time spent',
            },
          ],
          creator: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
        },
        {
          title: 'Issue #3: API Error Handling',
          notes: [
            {
              createdAt: '2025-02-04T08:00:00Z',
              updatedAt: '2025-02-04T08:00:00Z',
              body: 'added 3h of time spent',
            },
            {
              createdAt: '2025-02-04T09:00:00Z',
              updatedAt: '2025-02-04T09:00:00Z',
              body: 'removed 1h of time spent',
            },
          ],
          creator: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
        },
        {
          title: 'Issue #4: Improve Logging',
          notes: [
            {
              createdAt: '2025-02-05T08:15:00Z',
              updatedAt: '2025-02-05T08:15:00Z',
              body: 'added 2h of time spent',
            },
            {
              createdAt: '2025-02-05T10:00:00Z',
              updatedAt: '2025-02-05T10:00:00Z',
              body: 'added 45m of time spent',
            },
          ],
          creator: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
        },
        {
          title: 'Issue #5: Security Audit',
          notes: [
            {
              createdAt: '2025-02-06T08:30:00Z',
              updatedAt: '2025-02-06T08:30:00Z',
              body: 'added 1h of time spent',
            },
            {
              createdAt: '2025-02-06T09:30:00Z',
              updatedAt: '2025-02-06T09:30:00Z',
              body: 'added 2h of time spent',
            },
          ],
          creator: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
        },
        {
          title: 'Issue #6: Refactor User Service',
          notes: [
            {
              createdAt: '2025-02-07T07:45:00Z',
              updatedAt: '2025-02-07T07:45:00Z',
              body: 'added 1h 15m of time spent',
            },
            {
              createdAt: '2025-02-07T12:00:00Z',
              updatedAt: '2025-02-07T12:00:00Z',
              body: 'removed 15m of time spent',
            },
          ],
          creator: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
        },
        {
          title: 'Issue #7: Design Review Feedback',
          notes: [
            {
              createdAt: '2025-02-08T10:00:00Z',
              updatedAt: '2025-02-08T10:00:00Z',
              body: 'added 2h of time spent',
            },
            {
              createdAt: '2025-02-08T11:00:00Z',
              updatedAt: '2025-02-08T11:00:00Z',
              body: 'removed 30m of time spent',
            },
          ],
          creator: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
        },
        {
          title: 'Issue #8: Email Notifications',
          notes: [
            {
              createdAt: '2025-02-09T09:30:00Z',
              updatedAt: '2025-02-09T09:30:00Z',
              body: 'added 1h 30m of time spent',
            },
            {
              createdAt: '2025-02-09T10:45:00Z',
              updatedAt: '2025-02-09T10:45:00Z',
              body: 'added 15m of time spent',
            },
          ],
          creator: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
        },
        {
          title: 'Issue #9: Optimize Data Query',
          notes: [
            {
              createdAt: '2025-02-10T07:20:00Z',
              updatedAt: '2025-02-10T07:20:00Z',
              body: 'added 3h of time spent',
            },
            {
              createdAt: '2025-02-10T14:00:00Z',
              updatedAt: '2025-02-10T14:00:00Z',
              body: 'removed 45m of time spent',
            },
          ],
          creator: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
        },
        {
          title: 'Issue #10: Dependency Upgrades',
          notes: [
            {
              createdAt: '2025-02-11T08:00:00Z',
              updatedAt: '2025-02-11T08:00:00Z',
              body: 'added 2h of time spent',
            },
            {
              createdAt: '2025-02-11T09:00:00Z',
              updatedAt: '2025-02-11T09:00:00Z',
              body: 'added 1h of time spent',
            },
          ],
          creator: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
        },
      ];
      resolve(timeSpents);
    });
  }
}
