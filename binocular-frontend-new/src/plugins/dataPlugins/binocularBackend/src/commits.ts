import { GraphQL, traversePages } from './utils';
import { gql } from '@apollo/client';
import { DataPluginCommit, DataPluginCommits } from '../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export default class Commits implements DataPluginCommits {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting Commits from ${from} to ${to}`);
    const commitList: DataPluginCommit[] = [];
    const getCommitsPage = (to?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($page: Int, $perPage: Int, $until: Timestamp) {
            commits(page: $page, perPage: $perPage, until: $until) {
              count
              page
              perPage
              data {
                sha
                shortSha
                message
                messageHeader
                user {
                  id
                  gitSignature
                }
                branch
                parents
                date
                webUrl
                stats {
                  additions
                  deletions
                }
              }
            }
          }
        `,
        variables: { page, perPage, to },
      });
      return resp.data.commits;
    };

    await traversePages(getCommitsPage(to), (commit: DataPluginCommit) => {
      commitList.push(commit);
    });
    const allCommits = commitList.sort((a, b) => new Date(b.date).getMilliseconds() - new Date(a.date).getMilliseconds());
    return allCommits.filter((c) => new Date(c.date) >= new Date(from) && new Date(c.date) <= new Date(to));
  }
}
