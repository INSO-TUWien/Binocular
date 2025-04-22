import { GraphQL, traversePages } from './utils.ts';
import {
  DataPluginCommitFileChanges,
  DataPluginCommitsFilesChanges,
} from '../../../interfaces/dataPluginInterfaces/dataPluginCommitsFilesChanges.ts';
import { gql } from '@apollo/client';

export default class CommitsFilesChanges implements DataPluginCommitsFilesChanges {
  private readonly graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(sha: string) {
    console.log(`Getting Commits Files for ${sha}`);
    const fileList: DataPluginCommitFileChanges[] = [];
    const getFilesPage = (sha: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query GetCommitFiles($page: Int, $perPage: Int, $sha: String!) {
            commit(sha: $sha) {
              files(page: $page, perPage: $perPage) {
                data {
                  file {
                    path
                  }
                  stats {
                    additions
                    deletions
                  }
                }
                count
                page
                perPage
              }
            }
          }
        `,
        variables: { sha, page, perPage },
      });

      const files = resp.data?.commit?.files;
      if (!files) {
        console.warn(`No committed files found for SHA ${sha}`);
        return null;
      }

      return files;
    };

    await traversePages(getFilesPage(sha), (file: DataPluginCommitFileChanges) => {
      fileList.push(file);
    });
    return fileList;
  }
}
