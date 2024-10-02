import { GraphQL } from './utils.ts';
import { ApolloQueryResult, gql } from '@apollo/client';
import { DataPluginCommit, DataPluginCommits } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

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

export default class Commits implements DataPluginCommits {
  private graphQl;
  private owner;
  private name;
  constructor(apiKey: string, endpoint: string) {
    this.graphQl = new GraphQL(apiKey);
    this.owner = endpoint.split('/')[0];
    this.name = endpoint.split('/')[1];
  }
  public async getAll(from: string, to: string) {
    return await Promise.resolve(this.getCommits(100, new Date(from).toISOString(), new Date(to).toISOString()));
  }
  private async getCommits(perPage: number, from: string, to: string): Promise<DataPluginCommit[]> {
    let hasNextPage: boolean = true;
    let nextPageCursor: string | null = null;

    const commitNodes: DataPluginCommit[] = [];

    while (hasNextPage) {
      const resp: void | ApolloQueryResult<CommitQueryResult> = await this.graphQl.client
        .query<
          CommitQueryResult,
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
          variables: { nextPageCursor, perPage, from, to, owner: this.owner, name: this.name },
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
            user: { id: commit.author.user.id, gitSignature: commit.author.user.login },
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
}
