export interface DataPlugin {
  name: string;
  description: string;
  commits: DataCommits;
  authors: DataAuthors;
}

interface DataCommits {
  getAll: (from: string, to: string) => Promise<DataCommit[]>;
}

interface DataAuthors {
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
