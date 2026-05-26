import type { DataPluginUser, DataPluginUsers } from '../../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';

export default class Users implements DataPluginUsers {
  constructor() {}

  public async getAll() {
    console.log(`Getting Authors`);
    return new Promise<DataPluginUser[]>((resolve) => {
      const users: DataPluginUser[] = [
        {
          id: '1',
          gitSignature: 'tester@github.com',
          account: null,
        },
        {
          id: '2',
          gitSignature: 'tester2@github.com',
          account: null,
        },
        {
          id: '3',
          gitSignature: 'tester3@github.com',
          account: null,
        },
        {
          id: '4',
          gitSignature: 'tester4@github.com',
          account: null,
        },
      ];
      resolve(users);
    });
  }
}
