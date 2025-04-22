import { DataPluginStats } from './dataPluginCommits.ts';

export interface DataPluginCommitsFilesChanges {
  getAll: (sha: string) => Promise<DataPluginCommitFileChanges[]>;
}

export interface DataPluginCommitFileChanges {
  file: {
    path: string;
  };
  stats: DataPluginStats;
}
