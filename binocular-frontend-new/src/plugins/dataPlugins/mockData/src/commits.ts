import { DataPluginCommit, DataPluginCommitShort, DataPluginCommits } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default class Commits implements DataPluginCommits {
  constructor() {}

  public async getAllShort() {
    console.log('Getting all commits short');
    return new Promise<DataPluginCommitShort[]>((resolve) => {
      const commits: DataPluginCommitShort[] = [
        {
          sha: '1',
          date: '2024-06-01T12:00:00.000Z',
          messageHeader: 'Commit 1',
        },
        {
          sha: '2',
          date: '2024-01-02T12:00:00.000Z',
          messageHeader: 'Commit 2',
        },
      ];
      resolve(commits);
    });
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting Commits from ${from} to ${to}`);
    return new Promise<DataPluginCommit[]>((resolve) => {
      const commits: DataPluginCommit[] = [
        {
          sha: '0000000001',
          shortSha: '00001',
          messageHeader: 'Commit 1',
          message: 'This is the first Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
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
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
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
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
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
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
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
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
          branch: 'main',
          date: '2024-06-05T12:00:00.000Z',
          parents: ['0000000004'],
          webUrl: 'www.github.com',
          stats: { additions: 6, deletions: 10 },
        },
      ];
      resolve(commits);
    });
  }
}
