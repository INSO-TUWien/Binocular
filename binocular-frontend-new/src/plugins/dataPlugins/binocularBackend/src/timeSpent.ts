import { GraphQL, traversePages } from './utils.ts';
import { DataPluginTimeSpents, DataPluginTimeSpent } from '../../../interfaces/dataPluginInterfaces/dataPluginTimeSpent.ts';
import { gql } from '@apollo/client';

export default class TimeSpent implements DataPluginTimeSpents {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting TimeSpents from ${from} to ${to}`);
    const timeSpentEntryList: DataPluginTimeSpent[] = [];
    const getTimeSpentsPage = (from?: string, to?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query ($page: Int, $perPage: Int, $since: Timestamp, $until: Timestamp) {
            issues(page: $page, perPage: $perPage, since: $since, until: $until) {
              count
              page
              perPage
              data {
                title
                notes {
                  createdAt
                  updatedAt
                  body
                }
                creator {
                  id
                  gitlabName
                  gitSignature
                }
              }
            }
          }
        `,
        variables: { page, perPage, from, to },
      });
      return resp.data.timeSpentEntries;
    };
    await traversePages(getTimeSpentsPage(from, to), (timeSpentEntry: DataPluginTimeSpent) => {
      timeSpentEntryList.push(timeSpentEntry);
    });
    console.log(timeSpentEntryList);

    //const allTimeSpents = timeSpentEntryList.sort((a, b) => !a && !!b);
    return timeSpentEntryList;
  }
}
