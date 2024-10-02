import { DataPluginFile, DataPluginFiles } from '../../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';

export default class Files implements DataPluginFiles {
  constructor() {}

  public async getAll() {
    return new Promise<DataPluginFile[]>((resolve) => {
      const files: DataPluginFile[] = [
        {
          path: 'index.js',
          webUrl: 'https://github.com/INSO-TUWien/Binocular',
          maxLength: 5,
        },
        {
          path: 'src/app.js',
          webUrl: 'https://github.com/INSO-TUWien/Binocular',
          maxLength: 10,
        },
        {
          path: 'src/app.css',
          webUrl: 'https://github.com/INSO-TUWien/Binocular',
          maxLength: 8,
        },
      ];
      resolve(files);
    });
  }
}
