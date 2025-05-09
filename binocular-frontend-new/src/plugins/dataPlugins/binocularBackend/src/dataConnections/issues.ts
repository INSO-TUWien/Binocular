import { GraphQL, traversePages } from '../utils.ts';
import { gql } from '@apollo/client';
import { DataPluginIssue, DataPluginIssues } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';

export default class Issues implements DataPluginIssues {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting Issues from ${from} to ${to}`);
    try {
      const issueList: DataPluginIssue[] = [];
      const getIssuesPage = (from?: string, to?: string) => async (page: number, perPage: number) => {
        const resp = await this.graphQl.client.query({
          query: gql`
            query ($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
              issues(page: $page, perPage: $perPage, since: $since, until: $until) {
                count
                page
                perPage
                count
                data {
                  iid
                  title
                  createdAt
                  closedAt
                  updatedAt
                  webUrl
                  state
                  labels
                  author {
                    login
                    name
                  }
                  creator {
                    id
                    gitSignature
                  }
                  assignees {
                    login
                    name
                  }
                  assignee {
                    login
                    name
                  }
                  notes {
                    body
                    createdAt
                    author {
                      login
                      name
                    }
                  }
                }
              }
            }
          `,
          variables: { page, perPage, from, to },
        });
        return resp.data.issues;
      };
      await traversePages(getIssuesPage(from, to), (issue: DataPluginIssue) => {
        issueList.push(issue);
      });
      const allIssues = issueList.sort((a, b) => new Date(b.createdAt).getMilliseconds() - new Date(a.createdAt).getMilliseconds());
      return allIssues.filter((c) => new Date(c.createdAt) >= new Date(from) && new Date(c.createdAt) <= new Date(to));
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
