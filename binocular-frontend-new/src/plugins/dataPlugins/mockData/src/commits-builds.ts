import { DataPluginCommitsBuilds, DataPluginCommitBuild } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds';

export default class CommitsBuilds implements DataPluginCommitsBuilds {
  constructor() {}

  public async getAll(from: string, to: string) {
    console.log(`Getting CommitsBuilds from ${from} to ${to}`);
    return new Promise<DataPluginCommitBuild[]>((resolve) => {
      const commitsBuilds: DataPluginCommitBuild[] = [
        {
          // Commit data
          sha: '00001',
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
          // Build data
          build: {
            id: 1,
            status: 'failed',
            duration: '10',
            startedAt: '2024-06-01T12:00:00.000Z',
            finishedAt: '2024-06-01T12:00:00.000Z',
            jobs: [
              {
                id: 1,
                name: 'tester',
                status: 'failure',
                stage: 'failure',
              },
            ],
          },
        },
        {
          // Commit data
          sha: '00002',
          shortSha: '00002',
          messageHeader: 'Commit 2',
          message: 'This is the second Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
          branch: 'main',
          date: '2024-06-02T12:00:00.000Z',
          parents: ['00001'],
          webUrl: 'www.github.com',
          stats: { additions: 10, deletions: 20 },
          // Build data
          build: {
            id: 2,
            status: 'success',
            duration: '12',
            startedAt: '2024-06-02T12:00:00.000Z',
            finishedAt: '2024-06-02T12:00:00.000Z',
            jobs: [
              {
                id: 2,
                name: 'success',
                status: 'success',
                stage: 'success',
              },
            ],
          },
        },
        {
          // Commit data
          sha: '00003',
          shortSha: '00003',
          messageHeader: 'Commit 3',
          message: 'This is the third Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
          branch: 'main',
          date: '2024-06-03T12:00:00.000Z',
          parents: ['00002'],
          webUrl: 'www.github.com',
          stats: { additions: 2, deletions: 5 },
          // No build for this commit
        },
        {
          // Commit data
          sha: '00004',
          shortSha: '00004',
          messageHeader: 'Commit 4',
          message: 'This is the fourth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
          branch: 'main',
          date: '2024-06-04T12:00:00.000Z',
          parents: ['00003'],
          webUrl: 'www.github.com',
          stats: { additions: 20, deletions: 0 },
          // No build for this commit
        },
        {
          // Commit data
          sha: '00005',
          shortSha: '00005',
          messageHeader: 'Commit 5',
          message: 'This is the fifth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
          },
          branch: 'main',
          date: '2024-06-05T12:00:00.000Z',
          parents: ['00004'],
          webUrl: 'www.github.com',
          stats: { additions: 6, deletions: 10 },
          // Build data
          build: {
            id: 3,
            status: 'success',
            duration: '10',
            startedAt: '2024-06-10T12:00:00.000Z',
            finishedAt: '2024-06-10T12:00:00.000Z',
            jobs: [
              {
                id: 3,
                name: 'success',
                status: 'success',
                stage: 'success',
              },
            ],
          },
        },
        // Additional mock data with builds only (no corresponding commits)
        {
          // Minimal commit data for a build-only entry
          sha: '00006',
          shortSha: '00006',
          messageHeader: 'Build Only 1',
          message: 'This commit only has build data',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
          branch: 'feature',
          date: '2024-07-11T12:00:00.000Z',
          parents: ['00005'],
          webUrl: 'www.github.com',
          stats: { additions: 0, deletions: 0 },
          // Build data
          build: {
            id: 7,
            status: 'failed',
            duration: '10',
            startedAt: '2024-07-11T12:00:00.000Z',
            finishedAt: '2024-07-11T12:00:00.000Z',
            jobs: [
              {
                id: 7,
                name: 'failure',
                status: 'failure',
                stage: 'failure',
              },
            ],
          },
        },
        {
          // Minimal commit data for a build-only entry
          sha: '00007',
          shortSha: '00007',
          messageHeader: 'Build Only 2',
          message: 'This commit has a cancelled build',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
          },
          branch: 'feature',
          date: '2024-07-12T12:00:00.000Z',
          parents: ['00006'],
          webUrl: 'www.github.com',
          stats: { additions: 0, deletions: 0 },
          // Build data
          build: {
            id: 11,
            status: 'cancelled',
            duration: '10',
            startedAt: '2024-07-12T12:00:00.000Z',
            finishedAt: '2024-07-12T12:00:00.000Z',
            jobs: [
              {
                id: 11,
                name: 'cancelled',
                status: 'cancelled',
                stage: 'cancelled',
              },
            ],
          },
        },
      ];
      resolve(commitsBuilds);
    });
  }
}