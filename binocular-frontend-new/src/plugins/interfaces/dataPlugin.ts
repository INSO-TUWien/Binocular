export interface DataPlugin {
  name: string;
  description: string;
  commits: DataPluginCommits;
  authors: DataPluginAuthors;
  capabilities: string[];
  experimental: boolean;
  requirements: { apiKey: boolean; endpoint: boolean };
  setApiKey: (apiKey: string) => void;
}

export interface DataPluginCommits {
  getAll: (from: string, to: string) => Promise<DataCommit[]>;
}

export interface DataPluginAuthors {
  getAll: () => Promise<DataAuthor[]>;
}

export interface DataCommit {
  sha: string;
  shortSha: string;
  messageHeader: string;
  message: string;
  signature: string;
  branch: string;
  date: string;
  parents: string[];
  webUrl: string;
  stats: DataStats;
}

interface DataStats {
  additions: number;
  deletions: number;
}

export interface DataAuthor {
  gitSignature: string;
}
