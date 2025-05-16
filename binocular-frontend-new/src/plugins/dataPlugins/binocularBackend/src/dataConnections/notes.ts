import { GraphQL, traversePages } from '../utils.ts';
import { gql } from '@apollo/client';
import { DataPluginNote, DataPluginNotes } from '../../../../interfaces/dataPluginInterfaces/dataPluginNote.ts';

export default class Notes implements DataPluginNotes {
  private graphQl;

  constructor(endpoint: string) {
    this.graphQl = new GraphQL(endpoint);
  }

  public async getAll(from: string, to: string, sort: string = 'ASC') {
    console.log(`Getting Issues from ${from} to ${to}`);
    const notes: DataPluginNote[] = [];
    const getNotePage = (since?: string, until?: string, sort?: string) => async (page: number, perPage: number) => {
      const resp = await this.graphQl.client.query({
        query: gql`
          query Notes($page: Int, $perPage: Int, $until: Timestamp, $since: Timestamp, $sort: Sort) {
            notes(page: $page, perPage: $perPage, until: $until, since: $since, sort: $sort) {
              data {
                body
                createdAt
                issue {
                  id
                  iid
                  title
                }
                mergeRequest {
                  id
                  iid
                  title
                }
                author {
                  user {
                    id
                    gitSignature
                  }
                }
              }
            }
          }
        `,
        variables: { page, perPage, since, until, sort },
      });
      return resp.data.notes;
    };
    await traversePages(getNotePage(from, to, sort), (note: DataPluginNote) => {
      notes.push(note);
    });

    return notes;
  }
}
