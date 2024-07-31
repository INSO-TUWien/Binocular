import { DataPluginFile } from '../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';
import { graphQl, traversePages } from './utils.ts';
import { gql } from '@apollo/client';

export default {
  getAll: async () => {
    console.log(`Getting Files`);
    const fileList: DataPluginFile[] = [];
    const getFilesPage = () => async (page: number, perPage: number) => {
      const resp = await graphQl.query({
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
  },
};
