export interface FileChangeData {
  path: string;
  commitCount: number;
  totalAdditions: number;
  totalDeletions: number;
  totalChanges: number;
  averageChangesPerCommit?: number;
  lineCount?: number;
  commits: string[];
  firstModification?: string;
  lastModification?: string;
  owners?: {
    [author: string]: {
      additions: number;
      deletions: number;
      changes: number;
    };
  };
}

