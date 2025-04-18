import { GraphQL } from './utils.ts';
import { gql } from '@apollo/client';
import { DataPluginBranch, DataPluginBranches } from '../../../interfaces/dataPluginInterfaces/dataPluginBranches.ts';

export default class Branches implements DataPluginBranches {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  async getAllBranches(): Promise<DataPluginBranch[]> {
    return await this.graphQl.client
      .query({
        // variable tag not queried, because it cannot be found(maybe a keyword), not needed at the moment
        query: gql`
          query {
            branches(sort: "ASC") {
              data {
                branch
                active
                tracksFileRenames
                latestCommit
              }
            }
          }
        `,
      })
      .then((branches) => branches.data.branches.data);
  }
}
