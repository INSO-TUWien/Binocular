export interface DataPluginGeneral {
  getIndexer: () => DataPluginIndexer;
  getIndexerState: () => DataPluginIndexerState;
  getRepositoryName: () => Promise<string>;
}

export interface DataPluginIndexer {
  vcs: string;
  its: string;
  ci: string;
}

export enum DataPluginIndexerState {
  IDLE,
  INDEXING,
  FINISHED,
  CONNECTED,
  CONNECTION_FAILED,
}
