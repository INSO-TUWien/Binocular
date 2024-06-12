import { DataAuthor } from '../../../interfaces/dataPlugin.ts';

export default {
  getAll: () => {
    console.log(`Getting Authors`);
    return new Promise<DataAuthor[]>((resolve) => {
      const authors: DataAuthor[] = [
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
