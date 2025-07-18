import { GraphQL, traversePages } from './utils';
import { gql } from '@apollo/client';
import { DataPluginAccount, DataPluginAccounts } from '../../../interfaces/dataPluginInterfaces/dataPluginAccounts.ts';

export default class Accounts implements DataPluginAccounts {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll() {
    console.log(`Getting Accounts`);
    const accountList: DataPluginAccount[] = [];
    const getUsersPage = () => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query Accounts($perPage: Int, $page: Int) {
            accounts(perPage: $perPage, page: $page) {
              count
              perPage
              page
              data {
                platform
                login
                name
                url
                id
              }
            }
          }
        `,
        variables: { page, perPage },
      });
      return resp.data.accounts;
    };

    await traversePages(getUsersPage(), (account: DataPluginAccount) => {
      accountList.push(account);
    });
    return accountList;
  }

  // TODO: Implement this method, when new backend is ready
  public async saveAccountUserRelation(relation: DataPluginAccount) {
    console.log(`Saving Account-User Relation: ${JSON.stringify(relation)}`);
    return await Promise.resolve(true);
  }
}
