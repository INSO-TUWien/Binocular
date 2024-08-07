import { graphQl, traversePages } from './utils';
import { gql } from '@apollo/client';
import { DataPluginUser } from '../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';

export default {
  getAll: async () => {
    console.log(`Getting Authors`);
    const userList: DataPluginUser[] = [];
    const getUsersPage = () => async (page: number, perPage: number) => {
      const resp = await graphQl.query({
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
  },
};
