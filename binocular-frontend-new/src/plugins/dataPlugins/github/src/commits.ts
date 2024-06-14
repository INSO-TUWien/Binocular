import { DataCommit } from '../../../interfaces/dataPlugin.ts';
import { graphQl } from './utils.ts';
import { gql } from '@apollo/client';

export default {
  getAll: async (from: string, to: string) => {
    return await Promise.resolve(getCommits(100, new Date(from).toISOString(), new Date(to).toISOString()));
  },
};

async function getCommits(perPage: number, from: string, to: string): Promise<DataCommit[]> {
  let hasNextPage: boolean = true;
  let nextPageCursor: string | null = null;

  const commitNodes: DataCommit[] = [];

  while (hasNextPage) {
    const resp = await graphQl
      .query<
        {
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
                    author: { user: { login: string } };
                    parents: { totalCount: number; nodes: { oid: string }[] };
                  }[];
                };
              };
            };
          };
        },
        { nextPageCursor: string | null; perPage: number; from: string; to: string }
      >({
        query: gql`
          query ($nextPageCursor: String, $perPage: Int, $from: GitTimestamp, $to: GitTimestamp) {
            repository(owner: "INSO-TUWIEN", name: "Binocular") {
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
        variables: { nextPageCursor, perPage, from, to },
      })
      .catch((e) => console.log(e));

    if (resp) {
      console.log(resp.data.repository.defaultBranchRef.target.history.pageInfo.hasNextPage);
      resp.data.repository.defaultBranchRef.target.history.nodes.forEach((commit) => {
        if (commit.author.user === null) {
          return;
        }
        commitNodes.push({
          sha: commit.oid,
          shortSha: '',
          messageHeader: commit.messageHeadline,
          message: commit.message,
          signature: commit.author.user.login,
          branch: '',
          date: commit.committedDate,
          parents: commit.parents.nodes.map((parent) => parent.oid),
          webUrl: commit.url,
          stats: { additions: commit.additions, deletions: commit.deletions },
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
