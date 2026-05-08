import { findAllAccountsMergeRequests } from '../utils';
import Database from '../database';
import type {
  DataPluginAccountMergeRequests,
  DataPluginAccountsMergeRequests,
} from '../../../../interfaces/dataPluginInterfaces/dataPluginAccountsMergeRequests';

export default class AccountsMergeRequests implements DataPluginAccountsMergeRequests {
  public database: Database | undefined;
  constructor(database: Database | undefined) {
    this.database = database;
  }

  public async getAll() {
    if (this.database && this.database.documentStore && this.database.edgeStore) {
      return findAllAccountsMergeRequests(this.database.documentStore, this.database.edgeStore).then((res: { docs: unknown[] }) => {
        res.docs = res.docs as DataPluginAccountMergeRequests[];
        return res.docs as unknown as DataPluginAccountMergeRequests[];
      });
    } else {
      return new Promise<DataPluginAccountMergeRequests[]>((resolve) => {
        resolve([]);
      });
    }
  }
}
