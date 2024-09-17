import { DataPluginUser, DataPluginUsers } from '../../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';
import { findAll } from '../utils';
import { Database } from '../database';

export default class Users implements DataPluginUsers {
  public database: Database | undefined;
  constructor(database: Database | undefined) {
    this.database = database;
  }

  public async getAll() {
    console.log(`Getting Authors`);
    if (this.database && this.database.documentStore) {
      return findAll(this.database.documentStore, 'users').then((res: { docs: { gitSignature: string; _id: string; rev: string }[] }) => {
        return res.docs.map((user) => {
          return { gitSignature: user.gitSignature, id: user._id };
        });
      });
    } else {
      return new Promise<DataPluginUser[]>((resolve) => {
        const users: DataPluginUser[] = [];
        resolve(users);
      });
    }
  }
}
