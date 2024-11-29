import { DataPluginIssue, DataPluginIssues } from '../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export default class Issues implements DataPluginIssues {
  constructor() {}

  public async getAll(from: string, to: string) {
    console.log(`Getting Issues from ${from} to ${to}`);
    return new Promise<DataPluginIssue[]>((resolve) => {
      const issues: DataPluginIssue[] = [
        {
          id: '1976283326',
          iid: '194',
          title: '🔧 CLI Rework',
          description: '',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/194',
          createdAt: '2023-11-10T09:46:32Z',
          closedAt: '2023-11-21T08:50:52Z',
          author: {
            name: 'Maximilian Zenz',
          },
          assignee: {
            name: 'Maximilian Zenz',
          },
        },
        {
          id: '1976283327',
          iid: '196',
          title: 'Auto-versioning with NPM and Git',
          description: 'See https://javascript.plainenglish.io/auto-versioning-with-npm-and-git-786c6795b926',
          state: 'OPEN',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/196',
          createdAt: '2023-11-10T13:40:20Z',
          closedAt: null,
          author: {
            name: 'Manuel Stöger',
          },
          assignee: {
            name: 'Manuel Stöger',
          },
        },
        {
          id: '1976283328',
          iid: '203',
          title: 'Ignore files at index time',
          description:
            '- add field to `.binocularrc` that causes the backend to ignore specified files/directories during indexing\n- allow the use of wildcards',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/203',
          createdAt: '2023-11-26T12:07:24Z',
          closedAt: '2023-12-06T14:41:20Z',
          author: {
            name: 'Sebastian Watzinger',
          },
          assignee: {
            name: 'Sebastian Watzinger',
          },
        },
        {
          id: '1976283329',
          iid: '205',
          title: '➕CLI Export Command',
          description:
            'There should be a proper way to export databases through the binocular cli by providing a command that just exports a db. As options, it should be possible to select the db that you want to export and where to export as default it should export the db of the repo where binocular gets executed and into the folder it gets executed. it would be also good to have a command to list all the available databases that can be exported.',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/205',
          createdAt: '2023-12-01T09:16:05Z',
          closedAt: '2023-12-12T14:30:26Z',
          author: {
            name: 'Maximilian Zenz',
          },
          assignee: {
            name: 'Maximilian Zenz',
          },
        },
        {
          id: '1976283330',
          iid: '206',
          title: '🔧 remove deleted branches from database',
          description:
            'If a remote branch is deleted, it stays in the local database.\nRemove these branches (and their connections) from the database at index time.',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/206',
          createdAt: '2023-12-01T13:25:48Z',
          closedAt: '2023-12-10T10:26:10Z',
          author: {
            name: 'Sebastian Watzinger',
          },
          assignee: {
            name: 'Sebastian Watzinger',
          },
        },
        {
          id: '1976283331',
          iid: '207',
          title: 'Backend Frontend separation',
          description: '',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/207',
          createdAt: '2023-12-05T11:02:28Z',
          closedAt: '2024-02-05T09:05:00Z',
          author: {
            name: 'Manuel Stöger',
          },
          assignee: {
            name: 'Manuel Stöger',
          },
        },
        {
          id: '1976283332',
          iid: '209',
          title: '🐛 Bugs in Dashboard Visualizations',
          description:
            '- changes visualization:\r\n  - Stacked area chart sometimes has gaps, does not display data correctly\r\n  - in standalone mode (not as part of the dashboard), universal time settings have no effect (same with issues, CI)\r\n- time spent visualization:\r\n  - Overall amount of spent time varies depending on granularity setting\r\n  - Stacked area chart sometimes has gaps, does not display data correctly',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/209',
          createdAt: '2023-12-10T11:32:48Z',
          closedAt: '2024-02-07T14:43:47Z',
          author: {
            name: 'Sebastian Watzinger',
          },
          assignee: {
            name: 'Sebastian Watzinger',
          },
        },
        {
          id: '1976283333',
          iid: '212',
          title: '🐛 Dockerfile installation bug',
          description:
            'The Backend Dockerfile has a bug with the installation of Binocular with linux\r\n\r\n```\r\n# Error: Cannot find module @rollup/rollup-linux-x64-musl.\r\n    # npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828).\r\n    # Please try `npm i` again after removing both package-lock.json and node_modules directory.\r\n```',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/212',
          createdAt: '2024-01-19T09:11:06Z',
          closedAt: '2024-01-19T12:17:00Z',
          author: {
            name: 'Maximilian Zenz',
          },
          assignee: {
            name: 'Maximilian Zenz',
          },
        },
        {
          id: '1976283335',
          iid: '219',
          title: '➕ Add option to run test cases in the new cli',
          description: '',
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/219',
          createdAt: '2024-02-05T09:10:46Z',
          closedAt: '2024-02-07T09:47:38Z',
          author: {
            name: 'Maximilian Zenz',
          },
          assignee: {
            name: 'Maximilian Zenz',
          },
        },
        {
          id: '1976283336',
          iid: '222',
          title: '🔧Improve Local Storage',
          description:
            "The current implementation of the local storage, especially for the universal settings does not behave as expected if the author list changed from the last time binocular was executed. Maybe also include a local storage version so that it's easier to recognize with which version of Binocular the local storage was created so that it can be initialized when the version changes.",
          state: 'CLOSED',
          webUrl: 'https://github.com/INSO-TUWien/Binocular/issues/222',
          createdAt: '2024-02-07T09:50:54Z',
          closedAt: '2024-02-09T10:20:44Z',
          author: {
            name: 'Maximilian Zenz',
          },
          assignee: {
            name: 'Maximilian Zenz',
          },
        },
      ];
      resolve(issues);
    });
  }
}
