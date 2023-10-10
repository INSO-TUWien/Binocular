export interface IBounds {
  firstCommit: IBoundsCommit;
  lastCommit: IBoundsCommit;
  committers: string[];
  firstIssue: IBoundsIssue;
  lastIssue: IBoundsIssue;
}

export interface IBoundsCommit {
  date: string;
  stats: {
    additions: number;
    deletions: number;
  };
}

export interface IBoundsIssue {
  createdAt: string;
  closedAt: string;
}
