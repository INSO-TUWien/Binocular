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

  public async saveAccountUserRelation(relation: DataPluginAccount) {
    console.log(`Saving Account-User Relation: ${JSON.stringify(relation)}`);
    return new Promise((resolve) => {
      // Simulate saving the relation
      setTimeout(() => {
        console.log('Account relation saved successfully');
        resolve(true);
      }, 10);
    });
  }
}
