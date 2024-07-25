export interface DataPluginAuthors {
  getAll: () => Promise<DataPluginAuthor[]>;
}

export interface DataPluginAuthor {
  gitSignature: string;
}
