export interface DataPluginFiles {
  getAll: () => Promise<DataPluginFile[]>;
}

export interface DataPluginFile {
  path: string;
  webUrl: string;
  maxLength: number;
}
