import { DataAuthor } from '../../../interfaces/dataPlugin.ts';
import { graphQl, traversePages } from './utils';
import { gql } from '@apollo/client';

export default {
  getAll: async () => {
    console.log(`Getting Authors`);
    const authorList: DataAuthor[] = [];
    const getAuthorsPage = () => async (page: number, perPage: number) => {
      const resp = await graphQl.query({
        query: gql`
          query ($page: Int, $perPage: Int) {
            stakeholders(page: $page, perPage: $perPage) {
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
      return resp.data.stakeholders;
    };

    await traversePages(getAuthorsPage(), (author: DataAuthor) => {
      authorList.push(author);
    });
    return authorList;
  },
};
