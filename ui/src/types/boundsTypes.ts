export interface Bounds {
  firstCommit: BoundsCommit;
  lastCommit: BoundsCommit;
  committers: string[];
  firstIssue: BoundsIssue;
  lastIssue: BoundsIssue;
}

export interface BoundsCommit {
  date: string;
  stats: {
    additions: number;
    deletions: number;
  };
}

export interface BoundsIssue {
  createdAt: string;
  closedAt: string;
}
