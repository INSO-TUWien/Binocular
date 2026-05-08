import { gql } from '@apollo/client';
import { GraphQL, traversePages } from '../utils.ts';
import type {
  DataPluginAccountMergeRequests,
  DataPluginAccountsMergeRequests,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests.ts';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';

export default class AccountsMergeRequests implements DataPluginAccountsMergeRequests {
  private readonly graphQl: GraphQL;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  /**
   * Fetches all merge requests in the date range and distributes them to their
   * author and assignee accounts, returning one entry per account.
   */
  public async getAll(from: string, to: string): Promise<DataPluginAccountMergeRequests[]> {
    console.log(`Getting all Accounts with MergeRequests from:${from} to:${to}:`);

    // Step 1: build account map from the accounts list so every known account is represented
    const accountMap = new Map<string, DataPluginAccountMergeRequests>();
    const getAccountsPage =
      () =>
      async (page: number, perPage: number = 1000) => {
        const response = await this.graphQl.client.query({
          query: gql`
            query getAccountsForMR($page: Int, $perPage: Int) {
              accounts(page: $page, perPage: $perPage) {
                count
                page
                perPage
                data {
                  login
                  name
                  avatarUrl
                  url
                }
              }
            }
          `,
          variables: { page, perPage },
        });
        return response.data.accounts;
      };

    // @ts-expect-error ignores any on the api call
    await traversePages(getAccountsPage(), (record) => {
      accountMap.set(record.login, {
        id: record.login,
        login: record.login,
        name: record.name,
        avatarUrl: record.avatarUrl,
        url: record.url,
        mergeRequests: [],
      });
    });

    // Step 2: fetch all MRs and distribute to author / assignee accounts
    const getMergeRequestsPage =
      (since?: string, until?: string) =>
      async (page: number, perPage: number = 1000) => {
        const response = await this.graphQl.client.query({
          query: gql`
            query getMergeRequestsForCollaboration($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
              mergeRequests(page: $page, perPage: $perPage, since: $since, until: $until) {
                count
                page
                perPage
                data {
                  id
                  iid
                  title
                  createdAt
                  closedAt
                  state
                  webUrl
                  sourceBranch
                  targetBranch
                  author {
                    login
                    name
                    avatarUrl
                    url
                  }
                  assignees {
                    login
                    name
                    avatarUrl
                    url
                  }
                  notes {
                    author {
                      login
                      name
                      avatarUrl
                      url
                    }
                    body
                    createdAt
                    updatedAt
                  }
                }
              }
            }
          `,
          variables: { page, perPage, since, until },
        });
        return response.data.mergeRequests;
      };

    // @ts-expect-error ignores any on the api call
    await traversePages(getMergeRequestsPage(from, to), (mr) => {
      const mrData: DataPluginMergeRequest = {
        id: mr.id,
        iid: mr.iid,
        title: mr.title,
        createdAt: mr.createdAt,
        closedAt: mr.closedAt,
        updatedAt: null,
        state: mr.state,
        webUrl: mr.webUrl,
        sourceBranch: mr.sourceBranch,
        targetBranch: mr.targetBranch,
        author: null,
        assignee: null,
        assignees: [],
        // @ts-expect-error ignores any on the api call
        notes: (mr.notes ?? []).map((n) => ({
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
          body: n.body,
          issue: null,
          mergeRequest: null,
          author: { id: n.author.login, name: n.author.name, user: null, platform: '' },
        })),
      };

      if (mr.author?.login && accountMap.has(mr.author.login)) {
        accountMap.get(mr.author.login)!.mergeRequests.push(mrData);
      }
      // @ts-expect-error ignores any on the api call
      (mr.assignees ?? []).forEach((assignee) => {
        if (assignee?.login && accountMap.has(assignee.login) && assignee.login !== mr.author?.login) {
          accountMap.get(assignee.login)!.mergeRequests.push(mrData);
        }
      });
    });

    return Array.from(accountMap.values());
  }
}
