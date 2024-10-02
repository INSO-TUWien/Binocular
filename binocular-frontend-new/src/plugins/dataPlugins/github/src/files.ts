import { DataPluginFile } from '../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';

export default {
  getAll: () => {
    console.log(`Getting Files`);
    return new Promise<DataPluginFile[]>((resolve) => {
      const files: DataPluginFile[] = [];
      resolve(files);
    });
  },
};
