import { DataCommit } from '../../../interfaces/dataPlugin.ts';

export default {
  getAll: (from?: string, to?: string) => {
    console.log(`Getting Commits from ${from} to ${to}`);
    return new Promise<DataCommit[]>((resolve) => {
      const commits: DataCommit[] = [
        {
          sha: '0000000001',
          shortSha: '00001',
          messageHeader: 'Commit 1',
          message: 'This is the first Commit',
          signature: 'tester@github.com',
          branch: 'main',
          date: '2024-06-01T12:00:00.000Z',
          parents: [],
          webUrl: 'www.github.com',
          stats: { additions: 5, deletions: 0 },
        },
        {
          sha: '0000000002',
          shortSha: '00002',
          messageHeader: 'Commit 2',
          message: 'This is the second Commit',
          signature: 'tester2@github.com',
          branch: 'main',
          date: '2024-06-02T12:00:00.000Z',
          parents: ['0000000001'],
          webUrl: 'www.github.com',
          stats: { additions: 10, deletions: 20 },
        },
        {
          sha: '0000000003',
          shortSha: '00003',
          messageHeader: 'Commit 3',
          message: 'This is the third Commit',
          signature: 'tester2@github.com',
          branch: 'main',
          date: '2024-06-03T12:00:00.000Z',
          parents: ['0000000002'],
          webUrl: 'www.github.com',
          stats: { additions: 2, deletions: 5 },
        },
        {
          sha: '0000000004',
          shortSha: '00004',
          messageHeader: 'Commit 4',
          message: 'This is the fourth Commit',
          signature: 'tester@github.com',
          branch: 'main',
          date: '2024-06-04T12:00:00.000Z',
          parents: ['0000000003'],
          webUrl: 'www.github.com',
          stats: { additions: 20, deletions: 0 },
        },
        {
          sha: '0000000005',
          shortSha: '00005',
          messageHeader: 'Commit 5',
          message: 'This is the fifth Commit',
          signature: 'tester@github.com',
          branch: 'main',
          date: '2024-06-05T12:00:00.000Z',
          parents: ['0000000004'],
          webUrl: 'www.github.com',
          stats: { additions: 6, deletions: 10 },
        },
      ];
      resolve(commits);
    });
  },
};
