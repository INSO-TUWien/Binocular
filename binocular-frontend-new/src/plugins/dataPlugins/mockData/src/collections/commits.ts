import type {
  DataPluginCommit,
  DataPluginCommits,
  DataPluginOwnership,
  DataPluginCommitBuild,
  DataPluginCommitShort,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import Builds from './builds.ts';
import type { DataPluginFileInCommit } from '../../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';

export default class Commits implements DataPluginCommits {
  private builds: Builds;

  constructor() {
    this.builds = new Builds();
  }

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
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 1',
          message: 'This is the first Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-06-01T12:00:00.000Z', // Matches build id 1
          parents: [],
          webUrl: 'www.github.com',
          stats: { additions: 500, deletions: 0 },
        },
        {
          sha: '0000000002',
          shortSha: '00002',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 2',
          message: 'This is the second Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-06-02T12:00:00.000Z', // Matches build id 2
          parents: ['0000000001'],
          webUrl: 'www.github.com',
          stats: { additions: 240, deletions: 20 },
        },
        {
          sha: '0000000003',
          shortSha: '00003',
          files: {
            data: [
              {
                file: {
                  path: 'src/app.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 3',
          message: 'This is the third Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-06-10T12:00:00.000Z', // Matches build id 3
          parents: ['0000000002'],
          webUrl: 'www.github.com',
          stats: { additions: 2, deletions: 5 },
        },
        {
          sha: '0000000004',
          shortSha: '00004',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 4',
          message: 'This is the fourth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-06-11T12:00:00.000Z', // Matches build id 4
          parents: ['0000000003'],
          webUrl: 'www.github.com',
          stats: { additions: 20, deletions: 0 },
        },
        {
          sha: '0000000005',
          shortSha: '00005',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 5',
          message: 'This is the fifth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-07-10T12:00:00.000Z', // Matches build id 5
          parents: ['0000000004'],
          webUrl: 'www.github.com',
          stats: { additions: 6, deletions: 10 },
        },
        {
          sha: '0000000006',
          shortSha: '00006',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 6',
          message: 'This is the sixth Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-07-11T12:00:00.000Z', // Matches build id 6 and 7
          parents: ['0000000005'],
          webUrl: 'www.github.com',
          stats: { additions: 15, deletions: 3 },
        },
        {
          sha: '0000000007',
          shortSha: '00007',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 7',
          message: 'This is the seventh Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-07-12T12:00:00.000Z', // Matches build id 11
          parents: ['0000000006'],
          webUrl: 'www.github.com',
          stats: { additions: 8, deletions: 4 },
        },
        {
          sha: '0000000008',
          shortSha: '00008',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 8',
          message: 'This is the eighth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-08-11T12:00:00.000Z', // Matches build id 8, 9, and 10
          parents: ['0000000007'],
          webUrl: 'www.github.com',
          stats: { additions: 12, deletions: 7 },
        },
        {
          sha: '0000000009',
          shortSha: '00009',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 9',
          message: 'This is the ninth Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-08-13T12:00:00.000Z', // Matches build id 12
          parents: ['0000000008'],
          webUrl: 'www.github.com',
          stats: { additions: 5, deletions: 2 },
        },
        {
          sha: '0000000010',
          shortSha: '00010',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 10',
          message: 'This is the tenth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-08-14T12:00:00.000Z', // Matches build id 13
          parents: ['0000000009'],
          webUrl: 'www.github.com',
          stats: { additions: 9, deletions: 1 },
        },
        // Additional commit that doesn't match any build
        {
          sha: '0000000011',
          shortSha: '00011',
          files: {
            data: [
              {
                file: {
                  path: 'index.js',
                  webUrl: '',
                  maxLength: 0,
                },
                hunks: [],
                stats: { additions: 500, deletions: 0 },
              },
            ],
          },
          messageHeader: 'Commit 11',
          message: 'This is the eleventh Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-08-20T12:00:00.000Z', // No matching build
          parents: ['0000000010'],
          webUrl: 'www.github.com',
          stats: { additions: 3, deletions: 3 },
        },
      ];
      resolve(commits);
    });
  }

  public async getOwnershipDataForCommits(): Promise<DataPluginOwnership[]> {
    return new Promise<DataPluginOwnership[]>((resolve) => {
      const commits: DataPluginOwnership[] = [
        {
          sha: '0000000001',
          date: '2024-10-22T11:03:56.000Z',
          parents: [],
          files: [
            {
              path: 'index.js',
              action: 'modified',
              ownership: [
                {
                  user: 'tester@github.com',
                  hunks: [
                    {
                      originalCommit: '0f8698d63dc6cf3cf8738a9265ee0696d4455b4e',
                      lines: [
                        {
                          from: 3,
                          to: 3,
                        },
                      ],
                    },
                    {
                      originalCommit: '6bd222e5ecf9c39205d8a93584bc0cf6c1d27602',
                      lines: [
                        {
                          from: 22,
                          to: 22,
                        },
                      ],
                    },
                    {
                      originalCommit: '95adf1175cd63b419dcf8f4a42a6b0eb74edb35b',
                      lines: [
                        {
                          from: 42,
                          to: 45,
                        },
                        {
                          from: 47,
                          to: 51,
                        },
                      ],
                    },
                    {
                      originalCommit: '81c28029f8cf1f9b73cef85a60972a6b10636d1f',
                      lines: [
                        {
                          from: 46,
                          to: 46,
                        },
                      ],
                    },
                    {
                      originalCommit: 'cfd794804950fa431ad5922c1a185875a288ba32',
                      lines: [
                        {
                          from: 52,
                          to: 54,
                        },
                        {
                          from: 56,
                          to: 56,
                        },
                      ],
                    },
                    {
                      originalCommit: '7a1a2cffe8bff6dbffff1e35bdc2a2219aad5e47',
                      lines: [
                        {
                          from: 55,
                          to: 55,
                        },
                        {
                          from: 101,
                          to: 101,
                        },
                      ],
                    },
                    {
                      originalCommit: 'cacd3718f698ae470203b9015e1158b62d9ed846',
                      lines: [
                        {
                          from: 95,
                          to: 95,
                        },
                      ],
                    },
                  ],
                },
                {
                  user: 'tester2@github.com',
                  hunks: [
                    {
                      originalCommit: 'a66566b0e160c058128802d07d45371950ad26d9',
                      lines: [
                        {
                          from: 1,
                          to: 1,
                        },
                      ],
                    },
                    {
                      originalCommit: '9272651e0d1868cfc643bfd2c54fc6b43d33495e',
                      lines: [
                        {
                          from: 4,
                          to: 5,
                        },
                      ],
                    },
                    {
                      originalCommit: 'e0fa0e34119f784c5844ceca0c6200fefdbf5420',
                      lines: [
                        {
                          from: 6,
                          to: 6,
                        },
                      ],
                    },
                    {
                      originalCommit: '2abc639a12d71c78394a51cf5362490eddacd4dc',
                      lines: [
                        {
                          from: 11,
                          to: 12,
                        },
                        {
                          from: 14,
                          to: 14,
                        },
                        {
                          from: 17,
                          to: 17,
                        },
                      ],
                    },
                    {
                      originalCommit: '03f1b9416dfe52d27f3c30fe9793181f52c32d3d',
                      lines: [
                        {
                          from: 13,
                          to: 13,
                        },
                        {
                          from: 15,
                          to: 16,
                        },
                      ],
                    },
                    {
                      originalCommit: '851e80158cd8a522db1e042e15341d0672e05aed',
                      lines: [
                        {
                          from: 19,
                          to: 19,
                        },
                      ],
                    },
                    {
                      originalCommit: '53a18f299e4d7358254db1e853df6dcad79272b4',
                      lines: [
                        {
                          from: 20,
                          to: 20,
                        },
                      ],
                    },
                    {
                      originalCommit: 'bd0b24fb1e2b2c156b509cfd51b366a2c1e33828',
                      lines: [
                        {
                          from: 21,
                          to: 21,
                        },
                      ],
                    },
                    {
                      originalCommit: '178d92d98e858e017cf9f69ad214a20c73f82dd7',
                      lines: [
                        {
                          from: 141,
                          to: 157,
                        },
                        {
                          from: 161,
                          to: 164,
                        },
                        {
                          from: 166,
                          to: 168,
                        },
                      ],
                    },
                    {
                      originalCommit: 'c00312d7b361fff171311a18a0df0963cbfe5769',
                      lines: [
                        {
                          from: 158,
                          to: 160,
                        },
                      ],
                    },
                    {
                      originalCommit: 'f43e1fbc3e7df9f182a63702876cce9213c4da5d',
                      lines: [
                        {
                          from: 165,
                          to: 165,
                        },
                        {
                          from: 171,
                          to: 171,
                        },
                        {
                          from: 177,
                          to: 177,
                        },
                      ],
                    },
                    {
                      originalCommit: '5189091e321fc8d5423ab06f0c4fc1202662206b',
                      lines: [
                        {
                          from: 169,
                          to: 170,
                        },
                        {
                          from: 172,
                          to: 176,
                        },
                        {
                          from: 178,
                          to: 181,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          sha: '0000000002',
          date: '2024-11-25T15:05:10.000Z',
          parents: ['0000000001'],
          files: [
            {
              path: 'index.js',
              action: 'modified',
              ownership: [
                {
                  user: 'tester@github.com',
                  hunks: [
                    {
                      originalCommit: '2fdcb8cfa4acacc31ad81c25a83ea08233c154bb',
                      lines: [
                        {
                          from: 168,
                          to: 168,
                        },
                      ],
                    },
                  ],
                },
                {
                  user: 'tester2@github.com',
                  hunks: [
                    {
                      originalCommit: '5f13d85a7c3a2e62711e5e78f79f04854ecc5907',
                      lines: [
                        {
                          from: 24,
                          to: 24,
                        },
                      ],
                    },
                    {
                      originalCommit: 'fae71bc4ee0ed6bb7cd82b1b6925689c5b2132e3',
                      lines: [
                        {
                          from: 28,
                          to: 39,
                        },
                        {
                          from: 54,
                          to: 54,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              path: 'src/app.js',
              action: 'modified',
              ownership: [
                {
                  user: 'tester2@github.com',
                  hunks: [
                    {
                      originalCommit: '5f13d85a7c3a2e62711e5e78f79f04854ecc5907',
                      lines: [
                        {
                          from: 134,
                          to: 134,
                        },
                        {
                          from: 143,
                          to: 145,
                        },
                        {
                          from: 152,
                          to: 152,
                        },
                        {
                          from: 167,
                          to: 167,
                        },
                        {
                          from: 176,
                          to: 178,
                        },
                        {
                          from: 185,
                          to: 185,
                        },
                        {
                          from: 213,
                          to: 213,
                        },
                        {
                          from: 222,
                          to: 222,
                        },
                        {
                          from: 369,
                          to: 385,
                        },
                      ],
                    },
                  ],
                },
                {
                  user: 'tester@github.com',
                  hunks: [
                    {
                      originalCommit: '96532f5ee7afeeb9117138bb60c99541bd797491',
                      lines: [
                        {
                          from: 1,
                          to: 1,
                        },
                        {
                          from: 6,
                          to: 6,
                        },
                        {
                          from: 22,
                          to: 22,
                        },
                        {
                          from: 220,
                          to: 221,
                        },
                        {
                          from: 223,
                          to: 226,
                        },
                        {
                          from: 228,
                          to: 312,
                        },
                        {
                          from: 314,
                          to: 368,
                        },
                      ],
                    },
                    {
                      originalCommit: 'dd03c754af55a7cc1ffc9b1d60bcdab706cdf5e8',
                      lines: [
                        {
                          from: 2,
                          to: 2,
                        },
                        {
                          from: 4,
                          to: 4,
                        },
                        {
                          from: 8,
                          to: 20,
                        },
                        {
                          from: 23,
                          to: 24,
                        },
                        {
                          from: 26,
                          to: 27,
                        },
                        {
                          from: 29,
                          to: 44,
                        },
                        {
                          from: 50,
                          to: 59,
                        },
                        {
                          from: 63,
                          to: 65,
                        },
                        {
                          from: 71,
                          to: 75,
                        },
                        {
                          from: 78,
                          to: 91,
                        },
                      ],
                    },
                    {
                      originalCommit: '99acffef1b2694ad556e250e6edd228a5e7f7f0f',
                      lines: [
                        {
                          from: 3,
                          to: 3,
                        },
                        {
                          from: 7,
                          to: 7,
                        },
                        {
                          from: 153,
                          to: 166,
                        },
                        {
                          from: 168,
                          to: 172,
                        },
                        {
                          from: 202,
                          to: 203,
                        },
                        {
                          from: 205,
                          to: 212,
                        },
                        {
                          from: 214,
                          to: 214,
                        },
                        {
                          from: 218,
                          to: 219,
                        },
                      ],
                    },
                    {
                      originalCommit: 'b94fb06a9345cf133b5e16ec9543df16250d6968',
                      lines: [
                        {
                          from: 5,
                          to: 5,
                        },
                        {
                          from: 21,
                          to: 21,
                        },
                        {
                          from: 227,
                          to: 227,
                        },
                        {
                          from: 313,
                          to: 313,
                        },
                      ],
                    },
                    {
                      originalCommit: '55a7f044e43c24efab5610f8289350a2d92a221f',
                      lines: [
                        {
                          from: 28,
                          to: 28,
                        },
                        {
                          from: 45,
                          to: 49,
                        },
                        {
                          from: 60,
                          to: 62,
                        },
                        {
                          from: 66,
                          to: 70,
                        },
                        {
                          from: 101,
                          to: 101,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              path: 'src/app.css',
              action: 'modified',
              ownership: [
                {
                  user: 'tester2@github.com',
                  hunks: [
                    {
                      originalCommit: 'fae71bc4ee0ed6bb7cd82b1b6925689c5b2132e3',
                      lines: [
                        {
                          from: 1,
                          to: 3,
                        },
                        {
                          from: 5,
                          to: 77,
                        },
                        {
                          from: 82,
                          to: 167,
                        },
                      ],
                    },
                    {
                      originalCommit: '5f13d85a7c3a2e62711e5e78f79f04854ecc5907',
                      lines: [
                        {
                          from: 4,
                          to: 4,
                        },
                        {
                          from: 78,
                          to: 81,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];
      resolve(commits);
    });
  }

  public async getByFile(file: string) {
    console.log(`Getting Commits of file ${file}`);
    return new Promise<DataPluginCommit[]>((resolve) => {
      const commits: DataPluginCommit[] = [
        {
          sha: '0000000001',
          shortSha: '00001',
          files: { data: [] },
          messageHeader: 'Commit 1',
          message: 'This is the first Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
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
            account: null,
          },
          branch: 'main',
          date: '2024-06-02T12:00:00.000Z',
          parents: ['0000000001'],
          webUrl: 'www.github.com',
          stats: { additions: 10, deletions: 20 },
          files: {
            data: [],
          },
        },
        {
          sha: '0000000003',
          shortSha: '00003',
          messageHeader: 'Commit 3',
          message: 'This is the third Commit',
          user: {
            id: '2',
            gitSignature: 'tester2@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-06-03T12:00:00.000Z',
          parents: ['0000000002'],
          webUrl: 'www.github.com',
          stats: { additions: 2, deletions: 5 },
          files: {
            data: [],
          },
        },
        {
          sha: '0000000004',
          shortSha: '00004',
          messageHeader: 'Commit 4',
          message: 'This is the fourth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-06-04T12:00:00.000Z',
          parents: ['0000000003'],
          webUrl: 'www.github.com',
          stats: { additions: 20, deletions: 0 },
          files: {
            data: [],
          },
        },
        {
          sha: '0000000005',
          shortSha: '00005',
          messageHeader: 'Commit 5',
          message: 'This is the fifth Commit',
          user: {
            id: '1',
            gitSignature: 'tester@github.com',
            account: null,
          },
          branch: 'main',
          date: '2024-06-05T12:00:00.000Z',
          parents: ['0000000004'],
          webUrl: 'www.github.com',
          stats: { additions: 6, deletions: 10 },
          files: {
            data: [],
          },
        },
      ];
      resolve(commits);
    });
  }

  public async getCommitDataForSha(sha: string) {
    return new Promise<DataPluginCommit>((resolve) => {
      resolve({
        sha: sha,
        shortSha: '00001',
        files: { data: [] },
        messageHeader: 'Commit 1',
        message: 'This is the first Commit',
        user: {
          id: '1',
          gitSignature: 'tester@github.com',
          account: null,
        },
        branch: 'main',
        date: '2024-06-01T12:00:00.000Z',
        parents: ['0000000001'],
        webUrl: 'www.github.com',
        stats: { additions: 5, deletions: 0 },
      });
    });
  }

  public async getDateOfFirstCommit() {
    return new Promise<string>((resolve) => {
      resolve('2024-06-01T12:00:00.000Z');
    });
  }

  public async getDateOfLastCommit() {
    return new Promise<string>((resolve) => {
      resolve('2024-06-01T12:00:00.000Z');
    });
  }

  public async getCommitsWithBuilds(from: string, to: string): Promise<DataPluginCommitBuild[]> {
    console.log(`Getting CommitsBuilds from ${from} to ${to}`);
    // Get all commits and builds
    const commits = await this.getAll(from, to);
    const builds = await this.builds.getAll(from, to);

    // Map to create combined data
    const commitsBuilds: DataPluginCommitBuild[] = [];

    // For each commit, find a matching build based on timestamp
    for (const commit of commits) {
      const matchingBuild = builds.find((build) => build.committedAt === commit.date);
      // Only include commits that have a matching build
      if (matchingBuild) {
        const commitBuild: DataPluginCommitBuild = {
          ...commit,
          builds: [
            {
              id: matchingBuild.id,
              status: matchingBuild.status,
              duration: matchingBuild.duration,
              startedAt: matchingBuild.startedAt,
              finishedAt: matchingBuild.finishedAt,
              jobs: matchingBuild.jobs.map((job) => ({
                id: parseInt(job.id),
                name: job.name,
                status: job.status,
                stage: job.stage,
              })),
            },
          ],
        };

        commitsBuilds.push(commitBuild);
      }
    }

    return commitsBuilds;
  }

  public async getCommitsWithFiles(from: string, to: string): Promise<DataPluginCommit[]> {
    console.log(`Getting CommitsWithFiles from ${from} to ${to}`);

    // Get all commits
    const commits = await this.getAll(from, to);

    // Add mock file data to each commit
    const commitsWithFiles: DataPluginCommit[] = commits.map((commit) => {
      // Create sample files based on commit ID
      const fileCount = parseInt(commit.shortSha.slice(-1)) || 2; // Use last digit of shortSha to determine file count
      const files: DataPluginFileInCommit[] = Array.from(
        { length: fileCount },
        (_, i): DataPluginFileInCommit => ({
          file: {
            path: `src/file${i + 1}.js`,
            maxLength: i,
            webUrl: `${commit.webUrl}/files/${i + 1}`,
          },
          hunks: [],
        }),
      );

      // Return commit with files
      return {
        ...commit,
        files: { data: files },
      };
    });

    // Filter to only include commits with files
    const filteredCommits = commitsWithFiles.filter((commit) => commit.files && commit.files.data.length > 0);

    // Sort by date in descending order
    return filteredCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async getDateOfFirstCommit() {
    console.log(`Getting Date of First Commit`);
    return new Promise<string>((resolve) => {
      resolve('2024-06-01T12:00:00.000Z');
    });
  }

  public async getDateOfLastCommit() {
    console.log(`Getting Date of Last Commit`);
    return new Promise<string>((resolve) => {
      resolve('2024-06-05T12:00:00.000Z');
    });
  }
}
