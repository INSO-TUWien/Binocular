export interface DataPluginBranches {
  getAll: () => Promise<DataPluginBranch[]>;
}

export interface DataPluginBranch {
  branch: string;
  active: string;
  tracksFileRenames: string;
  latestCommit: string;
}
