import { DataCommit } from '../../../interfaces/dataPlugin.ts';
import { graphQl, traversePages } from './utils';
import { gql } from '@apollo/client';

export default {
  getAll: async (from: string, to: string) => {
    console.log(`Getting Commits from ${from} to ${to}`);
    const commitList: DataCommit[] = [];
    const getCommitsPage = (to?: string) => async (page: number, perPage: number) => {
      const resp = await graphQl.query({
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
                signature
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
        variables: {page, perPage, to},
      });
      return resp.data.commits;
    };

    await traversePages(getCommitsPage(to), (commit: DataCommit) => {
      commitList.push(commit);
    });
    const allCommits = commitList.sort((a, b) => new Date(b.date).getMilliseconds() - new Date(a.date).getMilliseconds());
    return allCommits.filter((c) => new Date(c.date) >= new Date(from) && new Date(c.date) <= new Date(to));
  },
};
