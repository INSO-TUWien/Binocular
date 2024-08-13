import {DataPluginFile, DataPluginFiles} from '../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';
import {GraphQL, traversePages} from './utils.ts';
import { gql } from '@apollo/client';

export default class Files implements DataPluginFiles {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll () {
    console.log(`Getting Files`);
    const fileList: DataPluginFile[] = [];
    const getFilesPage = () => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
            query ($page: Int, $perPage: Int) {
              files(page: $page, perPage: $perPage) {
                count
                page
                perPage
                data {
                  path
                  webUrl
                  maxLength
                }
              }
            }
          `,
        variables: { page, perPage },
      });
      return resp.data.files;
    };

    await traversePages(getFilesPage(), (file: DataPluginFile) => {
    fileList.push(file);
  });
  return fileList;
  }
}
