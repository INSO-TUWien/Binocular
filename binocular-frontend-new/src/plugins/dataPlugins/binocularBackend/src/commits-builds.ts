import { gql } from '@apollo/client';
import { GraphQL } from './utils';
import { DataPluginCommitBuild, DataPluginCommitsBuilds } from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsBuilds.ts';



export default class CommitsBuilds implements DataPluginCommitsBuilds {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string): Promise<DataPluginCommitBuild[]> {
    console.log(`Getting Commits with Build data from ${from} to ${to}`);
    
    // Query that leverages the commits-builds connection in the database
    const query = gql`
    query ($since: Timestamp, $until: Timestamp, $page: Int, $perPage: Int) {
      commitsWithBuilds(since: $since, until: $until, page: $page, perPage: $perPage) {
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
          build {
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
  `;

    // Fetch data using the connection-based query
    const resp = await this.graphQl.client.query({
      query,
      variables: { 
        since: new Date(from).getTime(), 
        until: new Date(to).getTime() 
      },
    });

    //TODO: Map response correctly and implement Pagination

    return resp.data.commitsWithBuilds.data;
  }
}