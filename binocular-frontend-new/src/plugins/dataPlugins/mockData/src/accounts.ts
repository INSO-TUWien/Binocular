import { DataPluginAccount, DataPluginAccounts } from '../../../interfaces/dataPluginInterfaces/dataPluginAccounts.ts';

export default class Accounts implements DataPluginAccounts {
  constructor() {}

  public async getAll() {
    console.log(`Getting Accounts`);
    return new Promise<DataPluginAccount[]>((resolve) => {
      const users: DataPluginAccount[] = [
        {
          id: '1',
          name: 'tester1',
          user: null,
          platform: 'Gitlab',
        },
        {
          id: '2',
          name: 'tester2',
          user: null,
          platform: 'Github',
        },
      ];
      resolve(users);
    });
  }
}
