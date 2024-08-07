import { DataPluginUser } from '../../../interfaces/dataPluginInterfaces/dataPluginUsers.ts';

export default {
  getAll: () => {
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
  },
};
