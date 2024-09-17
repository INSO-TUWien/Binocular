import { DataPluginCommit, DataPluginCommits } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { findAllCommits } from '../utils.js';
import { Database } from '../database.ts';

export default class Commits implements DataPluginCommits {
  private readonly database: Database | undefined;
  constructor(database: Database | undefined) {
    this.database = database;
  }

  public async getAll(from: string, to: string) {
    console.log(`Getting Commits from ${from} to ${to}`);
    // return all commits, filtering according to parameters can be added in the future
    const first = new Date(from).getTime();
    const last = new Date(to).getTime();
    if (this.database) {
      return findAllCommits(this.database.documentStore, this.database.edgeStore).then((res: { docs: DataPluginCommit[] }) => {
        res.docs = res.docs
          .filter((c) => new Date(c.date).getTime() >= first && new Date(c.date).getTime() <= last)
          .sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });

        return res.docs;
      });
    } else {
      return new Promise<DataPluginCommit[]>((resolve) => {
        const users: DataPluginCommit[] = [];
        resolve(users);
      });
    }
  }
}
