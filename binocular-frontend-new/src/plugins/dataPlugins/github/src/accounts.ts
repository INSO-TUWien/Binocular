import { DataPluginAccount, DataPluginAccounts } from '../../../interfaces/dataPluginInterfaces/dataPluginAccounts.ts';

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
}
