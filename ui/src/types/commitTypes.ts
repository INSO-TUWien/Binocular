export interface ICommit {
  sha: string;
  shortSha: string;
  messageHeader: string;
  message: string;
  signature: string;
  branch: string;
  date: string;
  parents: string[];
  webUrl: string;
  stats: IStats;
}

interface IStats {
  additions: number;
  deletions: number;
}
