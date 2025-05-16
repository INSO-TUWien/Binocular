import { GraphQL, traversePages } from '../utils.ts';
import { DataPluginIssues, DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { gql } from '@apollo/client';

export default class Issues implements DataPluginIssues {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string, sort: string = 'ASC') {
    console.log(`Getting Issues from ${from} to ${to}`);
    const issues: DataPluginIssue[] = [];
    const getIssuesPage = (since?: string, until?: string, sort?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
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
                updatedAt
                author {
                  login
                  name
                  user {
                    gitSignature
                    id
                  }
                }
                assignee {
                  login
                  name
                  user {
                    gitSignature
                    id
                  }
                }
                assignees {
                  login
                  name
                  user {
                    gitSignature
                    id
                  }
                }
                notes {
                  author {
                    id
                    name
                    user {
                      gitSignature
                      id
                    }
                  }
                  body
                  createdAt
                  updatedAt
                }
              }
            }
          }
        `,
        variables: { page, perPage, since, until, sort },
      });
      return resp.data.issues;
    };
    await traversePages(getIssuesPage(from, to, sort), (issue: DataPluginIssue) => {
      issues.push(issue);
    });
    return issues;
  }
}
