import {DataPluginCommit} from './dataPluginCommits'

export interface DataPluginCommitsBuilds {
    getAll: (from: string, to: string) => Promise<DataPluginCommitBuild[]>;
}

// Interface that combines commit and build information
export interface DataPluginCommitBuild extends DataPluginCommit {
    build?: {
      id: number;
      status: string;
      duration: string;
      startedAt: string;
      finishedAt: string;
      jobs: {
        id: number;
        name: string;
        status: string;
        stage: string;
      }[];
    };
  }