import { GraphQL } from './utils';
import { ApolloQueryResult, gql } from '@apollo/client';
import { DataPluginAuthor, DataPluginAuthors } from '../../../interfaces/dataPluginInterfaces/dataPluginAuthors.ts';

interface AuthorsQueryResult {
  repository: { assignableUsers: { totalCount: number; nodes: { name: string; email: string; login: string }[] } };
}

export default class Authors implements DataPluginAuthors {
  private graphQl;
  private owner;
  private name;
  constructor(apiKey: string, endpoint: string) {
    this.graphQl = new GraphQL(apiKey);
    this.owner = endpoint.split('/')[0];
    this.name = endpoint.split('/')[1];
  }
  public async getAll() {
    console.log(`Getting Authors`);
    return await Promise.resolve(this.getAuthors(100));
  }

  private async getAuthors(perPage: number): Promise<DataPluginAuthor[]> {
    const resp: void | ApolloQueryResult<AuthorsQueryResult> = await this.graphQl.client
      .query<AuthorsQueryResult, { perPage: number; owner: string; name: string }>({
        query: gql`
          query ($perPage: Int,$owner: String, $name: String) {
            repository($owner: String, $name: String) {
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
        variables: { perPage, owner: this.owner, name: this.name },
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
