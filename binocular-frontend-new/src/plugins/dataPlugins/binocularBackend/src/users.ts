import { GraphQL, traversePages } from './utils';
import { gql } from '@apollo/client';
import { DataPluginUser, DataPluginUsers } from '../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';

export default class Users implements DataPluginUsers {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll() {
    console.log(`Getting Authors`);
    const userList: DataPluginUser[] = [];
    const getUsersPage = () => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($page: Int, $perPage: Int) {
            users(page: $page, perPage: $perPage) {
              count
              page
              perPage
              data {
                id
                gitSignature
              }
            }
          }
        `,
        variables: { page, perPage },
      });
      return resp.data.users;
    };

    await traversePages(getUsersPage(), (author: DataPluginUser) => {
      userList.push(author);
    });
    return userList;
  }
}
