import { graphQl, traversePages } from './utils';
import { gql } from '@apollo/client';
import { DataPluginAuthor } from '../../../interfaces/dataPluginInterfaces/dataPluginAuthors.ts';

export default {
  getAll: async () => {
    console.log(`Getting Authors`);
    const authorList: DataPluginAuthor[] = [];
    const getAuthorsPage = () => async (page: number, perPage: number) => {
      const resp = await graphQl.query({
        query: gql`
          query ($page: Int, $perPage: Int) {
            users(page: $page, perPage: $perPage) {
              count
              page
              perPage
              data {
                gitSignature
              }
            }
          }
        `,
        variables: { page, perPage },
      });
      return resp.data.users;
    };

    await traversePages(getAuthorsPage(), (author: DataPluginAuthor) => {
      authorList.push(author);
    });
    return authorList;
  },
};
