import { GraphQL } from '../utils.ts';
import { type ApolloQueryResult, gql } from '@apollo/client';
import type {
  CommitFileChange,
  CommitWithFileChanges,
  DataPluginCommit,
  DataPluginCommitBuild,
  DataPluginCommitShort,
  DataPluginCommits,
  DataPluginOwnership,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

interface CommitQueryResult {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          totalCount: number;
          pageInfo: { endCursor: string; hasNextPage: boolean };
          nodes: {
            oid: string;
            messageHeadline: string;
            message: string;
            committedDate: string;
            url: string;
            deletions: number;
            additions: number;
            author: { user: { id: string; login: string } };
            parents: { totalCount: number; nodes: { oid: string }[] };
          }[];
        };
      };
    };
  };
}

interface CommitWithFilesQueryResult {
  repository: {
    defaultBranchRef: {
      target: {
        history: {
          totalCount: number;
          pageInfo: { endCursor: string; hasNextPage: boolean };
          nodes: {
            oid: string;
            messageHeadline: string;
            message: string;
            committedDate: string;
            url: string;
            deletions: number;
            additions: number;
            changedFilesIfAvailable: number;
            author: { user: { id: string; login: string } };
            parents: { totalCount: number; nodes: { oid: string }[] };
            associatedPullRequests: {
              nodes: {
                commits: { totalCount: number };
                files: {
                  nodes: {
                    path: string;
                    additions: number;
                    deletions: number;
                  }[];
                };
              }[];
            };
          }[];
        };
      };
    };
  };
}

export default class Commits implements DataPluginCommits {
  private graphQl;
  private owner;
  private name;
  private apiKey;

  constructor(apiKey: string, endpoint: string) {
    this.graphQl = new GraphQL(apiKey);
    this.apiKey = apiKey;
    this.owner = endpoint.split('/')[0];
    this.name = endpoint.split('/')[1];
  }
  public async getAll(from: string, to: string) {
    return await Promise.resolve(this.getCommits(100, new Date(from).toISOString(), new Date(to).toISOString()));
  }

  // from/to is the significant (visible) window. GitHub provides no per-commit line count, so only
  // that window is loaded and every returned commit is significant.
  public async getCommitDataWithFilesAndOwnership(from: string, to: string): Promise<CommitWithFileChanges[]> {
    return await this.fetchCommitsWithFiles(100, new Date(from).toISOString(), new Date(to).toISOString());
  }
  private async getCommits(perPage: number, from: string, to: string): Promise<DataPluginCommit[]> {
    let hasNextPage: boolean = true;
    let nextPageCursor: string | null = null;

    const commitNodes: DataPluginCommit[] = [];

    while (hasNextPage) {
      const resp: void | ApolloQueryResult<CommitQueryResult> = await this.graphQl.client
        .query<
          CommitQueryResult,
          {
            nextPageCursor: string | null;
            perPage: number;
            from: string;
            to: string;
            owner: string;
            name: string;
          }
        >({
          query: gql`
            query ($nextPageCursor: String, $perPage: Int, $from: GitTimestamp, $to: GitTimestamp, $owner: String!, $name: String!) {
              repository(owner: $owner, name: $name) {
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(after: $nextPageCursor, first: $perPage, since: $from, until: $to) {
                        pageInfo {
                          endCursor
                          hasNextPage
                        }
                        totalCount
                        nodes {
                          oid
                          messageHeadline
                          message
                          committedDate
                          url
                          deletions
                          additions
                          author {
                            user {
                              id
                              login
                            }
                          }
                          parents(first: 100) {
                            totalCount
                            nodes {
                              oid
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            nextPageCursor,
            perPage,
            from,
            to,
            owner: this.owner,
            name: this.name,
          },
        })
        .catch((e) => console.log(e));

      if (resp) {
        resp.data.repository.defaultBranchRef.target.history.nodes.forEach((commit) => {
          if (commit.author.user === null) {
            return;
          }
          commitNodes.push({
            sha: commit.oid,
            shortSha: '',
            files: undefined,
            messageHeader: commit.messageHeadline,
            message: commit.message,
            user: {
              id: commit.author.user.id,
              gitSignature: commit.author.user.login,
              account: null,
            },
            branch: '',
            date: commit.committedDate,
            parents: commit.parents.nodes.map((parent) => parent.oid),
            webUrl: commit.url,
            stats: {
              additions: commit.additions,
              deletions: commit.deletions,
            },
          });
        });
        nextPageCursor = resp.data.repository.defaultBranchRef.target.history.pageInfo.endCursor;
        hasNextPage = resp.data.repository.defaultBranchRef.target.history.pageInfo.hasNextPage;
      } else {
        hasNextPage = false;
      }
    }

    return commitNodes;
  }

  public async getOwnershipDataForCommits(): Promise<DataPluginOwnership[]> {
    return Promise.resolve([]);
  }

  public async getCommitDataForSha(_sha: string): Promise<DataPluginCommit> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return Promise.resolve({});
  }

  public async getByFile(file: string): Promise<DataPluginCommit[]> {
    console.log(`Getting Commits for file ${file}`);
    let hasNextPage: boolean = true;
    let nextPageCursor: string | null = null;
    const commitList: DataPluginCommit[] = [];
    const perPage = 100; // You can adjust this value or make it a parameter

    while (hasNextPage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resp: any = await this.graphQl.client
        .query({
          query: gql`
            query ($file: String!, $nextPageCursor: String, $perPage: Int) {
              file(path: $file) {
                commits(after: $nextPageCursor, first: $perPage) {
                  pageInfo {
                    endCursor
                    hasNextPage
                  }
                  data {
                    commit {
                      sha
                      message
                      messageHeader
                      date
                      stats {
                        additions
                        deletions
                      }
                    }
                    files(page: 1, perPage: 1000) {
                      data {
                        file {
                          path
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { nextPageCursor, perPage, file },
        })
        .catch((e) => {
          console.log(e);
          return null;
        });

      if (resp && resp.data.file.commits) {
        resp.data.file.commits.data.forEach((data: { commit: DataPluginCommit }) => {
          commitList.push(data.commit);
        });

        nextPageCursor = resp.data.file.commits.pageInfo.endCursor;
        hasNextPage = resp.data.file.commits.pageInfo.hasNextPage;
      } else {
        hasNextPage = false;
      }
    }

    const sortedCommits = commitList.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return sortedCommits;
  }

  public async getDateOfFirstCommit() {
    console.log(`Getting Date of First Commit`);
    const resp = await this.graphQl.client.query({
      query: gql`
        query ($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    nodes {
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { owner: this.owner, name: this.name },
    });
    return resp.data.repository.defaultBranchRef.target.history.nodes[0].committedDate;
  }

  public async getDateOfLastCommit() {
    console.log(`Getting Date of Last Commit`);
    const resp = await this.graphQl.client.query({
      query: gql`
        query ($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(last: 1) {
                    nodes {
                      committedDate
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { owner: this.owner, name: this.name },
    });
    return resp.data.repository.defaultBranchRef.target.history.nodes[0].committedDate;
  }

  public async getCommitsWithBuilds(_from: string, _to: string): Promise<DataPluginCommitBuild[]> {
    // not yet implemented
    return Promise.resolve([]);
  }

  public async getCommitsWithFiles(_from: string, _to: string): Promise<DataPluginCommit[]> {
    // not yet implemented
    return Promise.resolve([]);
  }

  public async getAllShort(): Promise<DataPluginCommitShort[]> {
    // not yet implemented
    return Promise.resolve([]);
  }

  // GitHub's GraphQL API does not expose a per-commit file list, so file changes come either from an
  // associated pull request (cheap, already in the GraphQL response) or, as a fallback, from the REST
  // commit endpoint. To keep that fallback from flooding the API we cap the number of commits, run the
  // REST lookups with bounded concurrency, and stop early if we hit the rate limit.
  private static readonly MAX_COMMITS = 1000;
  private static readonly REST_CONCURRENCY = 8;

  private async fetchCommitsWithFiles(perPage: number, from: string, to: string): Promise<CommitWithFileChanges[]> {
    interface RawCommit {
      oid: string;
      date: string;
      signature: string;
      message: string;
      url: string;
      parents: string[];
      additions: number;
      deletions: number;
      // Files derived from an associated PR; undefined means a REST fallback lookup is needed.
      prFiles?: CommitFileChange[];
    }

    const rawCommits: RawCommit[] = [];
    let hasNextPage: boolean = true;
    let nextPageCursor: string | null = null;
    let truncated = false;

    while (hasNextPage && rawCommits.length < Commits.MAX_COMMITS) {
      const resp: ApolloQueryResult<CommitWithFilesQueryResult> | undefined = await this.graphQl.client
        .query<
          CommitWithFilesQueryResult,
          { nextPageCursor: string | null; perPage: number; from: string; to: string; owner: string; name: string }
        >({
          query: gql`
            query ($nextPageCursor: String, $perPage: Int, $from: GitTimestamp, $to: GitTimestamp, $owner: String!, $name: String!) {
              repository(owner: $owner, name: $name) {
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(after: $nextPageCursor, first: $perPage, since: $from, until: $to) {
                        pageInfo {
                          endCursor
                          hasNextPage
                        }
                        totalCount
                        nodes {
                          oid
                          messageHeadline
                          message
                          committedDate
                          url
                          deletions
                          additions
                          changedFilesIfAvailable
                          author {
                            user {
                              id
                              login
                            }
                          }
                          parents(first: 100) {
                            totalCount
                            nodes {
                              oid
                            }
                          }
                          associatedPullRequests(first: 1) {
                            nodes {
                              commits {
                                totalCount
                              }
                              files(first: 100) {
                                nodes {
                                  path
                                  additions
                                  deletions
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { nextPageCursor, perPage, from, to, owner: this.owner, name: this.name },
        })
        .catch((e) => {
          console.log('Error fetching commits with files:', e);
          return undefined;
        });

      const history: CommitWithFilesQueryResult['repository']['defaultBranchRef']['target']['history'] | undefined =
        resp?.data?.repository?.defaultBranchRef?.target?.history;
      if (!history) {
        hasNextPage = false;
        break;
      }

      for (const commit of history.nodes) {
        if (!commit.author?.user) {
          continue;
        }
        if (rawCommits.length >= Commits.MAX_COMMITS) {
          truncated = true;
          break;
        }

        // The PR's file list is the whole PR diff, so it only equals this commit's changes when the
        // PR contains a single commit (e.g. squash-merges). For multi-commit PRs leave prFiles
        // undefined so the per-commit REST fallback resolves the real changes.
        const prNode = commit.associatedPullRequests?.nodes?.[0];
        const prFiles: CommitFileChange[] | undefined =
          prNode && prNode.commits?.totalCount === 1
            ? (prNode.files?.nodes ?? []).map((file) => ({
                file: { path: file.path },
                stats: { additions: file.additions, deletions: file.deletions },
              }))
            : undefined;

        rawCommits.push({
          oid: commit.oid,
          date: commit.committedDate,
          signature: commit.author.user.login,
          message: commit.message,
          url: commit.url,
          parents: commit.parents.nodes.map((parent) => parent.oid),
          additions: commit.additions,
          deletions: commit.deletions,
          prFiles,
        });
      }

      nextPageCursor = history.pageInfo.endCursor;
      hasNextPage = history.pageInfo.hasNextPage;
    }

    if (truncated || (hasNextPage && rawCommits.length >= Commits.MAX_COMMITS)) {
      console.warn(
        `change-frequency: commit history truncated at ${Commits.MAX_COMMITS} commits for ${this.owner}/${this.name}; narrow the date range for full coverage.`,
      );
    }

    // Resolve file changes for commits without an associated PR via REST, with bounded concurrency.
    const needsRest = rawCommits.filter((c) => c.prFiles === undefined);
    const restFiles = new Map<string, CommitFileChange[]>();
    let rateLimited = false;
    let cursor = 0;

    const worker = async () => {
      while (cursor < needsRest.length && !rateLimited) {
        const { oid } = needsRest[cursor++];
        restFiles.set(
          oid,
          await this.fetchCommitFilesViaRest(oid, () => {
            rateLimited = true;
          }),
        );
      }
    };

    await Promise.all(Array.from({ length: Math.min(Commits.REST_CONCURRENCY, needsRest.length) }, () => worker()));

    return rawCommits.map((c) => ({
      sha: c.oid,
      date: c.date,
      signature: c.signature,
      branch: '',
      message: c.message,
      webUrl: c.url,
      parents: c.parents,
      stats: { additions: c.additions, deletions: c.deletions },
      files: { data: c.prFiles ?? restFiles.get(c.oid) ?? [] },
      isSignificant: true,
    }));
  }

  // Fetch a single commit's file changes from the GitHub REST API. Invokes onRateLimit() and returns
  // an empty list when the rate limit is exhausted so callers can stop issuing further requests.
  private async fetchCommitFilesViaRest(oid: string, onRateLimit: () => void): Promise<CommitFileChange[]> {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.name}/commits/${oid}`, {
        headers: {
          Authorization: `token ${this.apiKey}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.ok) {
        const commitData: { files?: { filename: string; additions?: number; deletions?: number }[] } = await response.json();
        return (commitData.files ?? []).map((file) => ({
          file: { path: file.filename },
          stats: { additions: file.additions || 0, deletions: file.deletions || 0 },
        }));
      }

      if (response.status === 403 || response.status === 429) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        if (response.status === 429 || remaining === '0') {
          console.warn('change-frequency: GitHub REST rate limit reached; remaining commit files were skipped.');
          onRateLimit();
          return [];
        }
      }

      console.log(`REST API failed for commit ${oid.substring(0, 7)}: ${response.status}`);
      return [];
    } catch (error) {
      console.log(`Error fetching files for commit ${oid.substring(0, 7)}:`, error);
      return [];
    }
  }
}
