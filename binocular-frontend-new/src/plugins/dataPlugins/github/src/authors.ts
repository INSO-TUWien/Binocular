import { DataAuthor, DataPluginAuthors } from '../../../interfaces/dataPlugin.ts';
import { GraphQL } from './utils';
import { ApolloQueryResult, gql } from '@apollo/client';

interface AuthorsQueryResult {
  repository: { assignableUsers: { totalCount: number; nodes: { name: string; email: string; login: string }[] } };
}

export default class Authors implements DataPluginAuthors {
  private graphQl;

  constructor(apiKey: string) {
    this.graphQl = new GraphQL(apiKey);
  }
  public async getAll() {
    console.log(`Getting Authors`);
    return await Promise.resolve(this.getAuthors(100));
  }

  private async getAuthors(perPage: number): Promise<DataAuthor[]> {
    const resp: void | ApolloQueryResult<AuthorsQueryResult> = await this.graphQl.client
      .query<AuthorsQueryResult, { perPage: number }>({
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
}
