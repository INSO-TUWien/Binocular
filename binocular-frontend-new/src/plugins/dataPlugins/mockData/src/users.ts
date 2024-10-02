import { DataPluginUser, DataPluginUsers } from '../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';

export default class Users implements DataPluginUsers {
  constructor() {}

  public async getAll() {
    console.log(`Getting Authors`);
    return new Promise<DataPluginUser[]>((resolve) => {
      const users: DataPluginUser[] = [
        {
          id: '1',
          gitSignature: 'tester@github.com',
        },
        {
          id: '2',
          gitSignature: 'tester2@github.com',
        },
      ];
      resolve(users);
    });
  }
}
