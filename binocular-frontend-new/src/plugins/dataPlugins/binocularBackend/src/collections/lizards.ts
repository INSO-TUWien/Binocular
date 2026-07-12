import type { DataPluginLizard, DataPluginLizards } from '../../../../interfaces/dataPluginInterfaces/dataPluginLizards.ts';
import { GraphQL, traversePages } from '../utils.ts';
import { gql } from '@apollo/client';

export default class Lizards implements DataPluginLizards {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(): Promise<DataPluginLizard[]> {
    console.log('Getting Lizard Analysis');

    try {
      const lizardList: DataPluginLizard[] = [];

      const getLizardPage = () => async (page: number, perPage: number) => {
        const resp = await this.graphQl.client.query({
          query: gql`
            query ($page: Int, $perPage: Int) {
              lizardFileAnalysis(page: $page, perPage: $perPage) {
                count
                page
                perPage
                data {
                  filePath

                  maxNloc
                  maxCcn
                  maxTokens
                  maxParameters
                  maxLength

                  avgNloc
                  avgCcn
                  avgTokens
                  avgParameters
                  avgLength

                  functionCount

                  maxLizardScore
                  avgLizardScore
                  normalizedMaxLizardScore
                  normalizedAvgLizardScore
                }
              }
            }
          `,
          variables: { page, perPage },
        });

        return resp.data.lizardFileAnalysis;
      };

      await traversePages(getLizardPage(), (row: DataPluginLizard) => {
        lizardList.push(row);
      });

      return lizardList;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
