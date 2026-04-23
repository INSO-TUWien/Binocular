import { gql } from '@apollo/client';
import { GraphQL, traversePages } from './utils.ts';

export default class Export {
  private readonly graphQl: GraphQL;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }


  public async getAll() {

    const data: any[] = [];
     const getPage = (since?: string, until?: string) => async (page: number, perPage: number) => {
        const response = await this.graphQl.client.query({
          query: gql`
            query ($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
              commits(page: $page, perPage: $perPage, since: $since, until: $until) {
                data {
                  sha
                  date
                  message
                  webUrl
                  branch
                  stats {
                    additions
                    deletions
                  }
                }
              }
            }
          `,
          variables: { page, perPage, since, until },
        });
        return response.data.commits;
      };

    // @ts-expect-error ignores any on the api call
    await traversePages(getPage(new Date(0), new Date(Date.now())), (record) => {
      data.push(record);
    });

    return data;
  }
}
