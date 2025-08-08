import type { DataPluginAccount, DataPluginAccounts } from '../../../interfaces/dataPluginInterfaces/dataPluginAccounts.ts';

export default class Accounts implements DataPluginAccounts {
  constructor() {}
  public async getAll() {
    return await Promise.resolve(this.getAccounts());
  }
  private async getAccounts(): Promise<DataPluginAccount[]> {
    // TODO: find out if implementation is needed in any near future?
    await new Promise((resolve) => setTimeout(resolve, 10));
    return [];
  }

  // This method is just here to satisfy the interface and will not work with GitHub API.
  public async saveAccountUserRelation(relation: DataPluginAccount) {
    console.log(`Saving Account-User Relation: ${JSON.stringify(relation)}`);
    return await Promise.resolve(true);
  }
}
