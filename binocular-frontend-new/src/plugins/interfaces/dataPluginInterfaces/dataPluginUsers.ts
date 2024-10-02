export interface DataPluginUsers {
  getAll: () => Promise<DataPluginUser[]>;
}

export interface DataPluginUser {
  id: string;
  gitSignature: string;
}
