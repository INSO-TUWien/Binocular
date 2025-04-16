import { gql } from '@apollo/client';
import { GraphQL, traversePages } from './utils';
import { DataPluginCommitBuild, DataPluginCommitsBuilds } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts';

export default class CommitsBuilds implements DataPluginCommitsBuilds {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string): Promise<DataPluginCommitBuild[]> {
    console.log(`Getting Commits with Build data from ${from} to ${to}`);
    const commitBuildList: DataPluginCommitBuild[] = [];

    // Query that leverages the commits-builds connection in the database
    const getCommitsBuildsPage = (from?: string, to?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($since: Timestamp, $until: Timestamp, $page: Int, $perPage: Int) {
            commits(since: $since, until: $until, page: $page, perPage: $perPage) {
              count
              page
              perPage
              data {
                sha
                shortSha
                messageHeader
                message
                user {
                  id
                  gitSignature
                }
                branch
                date
                parents
                webUrl
                stats {
                  additions
                  deletions
                }
                builds {
                  id
                  status
                  duration
                  startedAt
                  finishedAt
                  jobs {
                    id
                    name
                    status
                    stage
                  }
                }
              }
            }
          }
        `,
        variables: {
          page,
          perPage,
          since: new Date(from).getTime(),
          until: new Date(to).getTime()
        },
      });
      return resp.data.commits;
    };

    // Fetch data using the connection-based query
    await traversePages(getCommitsBuildsPage(from, to), (commitBuild: DataPluginCommitBuild) => {
      commitBuildList.push(commitBuild);
    });
    return commitBuildList;
  }
}
