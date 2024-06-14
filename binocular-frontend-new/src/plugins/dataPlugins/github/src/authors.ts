import { DataAuthor } from '../../../interfaces/dataPlugin.ts';
import { graphQl } from './utils';
import { gql } from '@apollo/client';

export default {
  getAll: async () => {
    console.log(`Getting Authors`);

    async function getAuthors(perPage: number): Promise<DataAuthor[]> {
      const resp = await graphQl
        .query<
          { repository: { assignableUsers: { totalCount: number; nodes: { name: string; email: string; login: string }[] } } },
          { perPage: number }
        >({
          query: gql`
            query ($perPage: Int) {
              repository(owner: "INSO-TUWIEN", name: "Binocular") {
                assignableUsers(first: $perPage) {
                  totalCount
                  nodes {
                    name
                    email
                    login
                  }
                }
              }
            }
          `,
          variables: { perPage },
        })
        .catch((e) => console.log(e));
      if (resp) {
        return resp.data.repository.assignableUsers.nodes.map((assignableUser) => {
          return { gitSignature: assignableUser.login };
        });
      } else {
        return [];
      }
    }

    return await Promise.resolve(getAuthors(100));
  },
};
