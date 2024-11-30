import { GraphQL, traversePages } from './utils';
import { gql } from '@apollo/client';
import { DataPluginIssue, DataPluginIssues } from '../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export default class Issues implements DataPluginIssues {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting Issues from ${from} to ${to}`);
    const issueList: DataPluginIssue[] = [];
    const getIssuePage = (since?: string, until?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
        query($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
          issues(page: $page, perPage: $perPage, since: $since, until: $until) {
            page
            perPage
            count
            data {
              iid
              title
              state
              webUrl
              createdAt
              closedAt
              author{
                login
                name
              }
              assignee {
                login
                name
              }
              assignees {
                login
                name
              }
            }
          }
        }`,
        variables: { page, perPage, since, until },
      });
      console.log(resp.data.issues);
      return resp.data.issues;
    };

    await traversePages(getIssuePage(from, to), (issue: DataPluginIssue) => {
      issueList.push(issue);
    });
    return issueList;
  }
}
