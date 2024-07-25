import { DataPluginAuthor } from '../../../interfaces/dataPluginInterfaces/dataPluginAuthors.ts';

export default {
  getAll: () => {
    console.log(`Getting Authors`);
    return new Promise<DataPluginAuthor[]>((resolve) => {
      const authors: DataPluginAuthor[] = [
        {
          gitSignature: 'tester@github.com',
        },
        {
          gitSignature: 'tester2@github.com',
        },
      ];
      resolve(authors);
    });
  },
};
