import { DataPluginIndexer, DataPluginIndexerState } from '../../../interfaces/dataPluginInterfaces/dataPluginGeneral.ts';

export default {
  getIndexer: (): DataPluginIndexer => {
    return { vcs: 'ArangoDB', its: 'ArangoDB', ci: 'ArangoDB' };
  },
  getIndexerState: (): DataPluginIndexerState => {
    return DataPluginIndexerState.IDLE;
  },
  getRepositoryName: (): Promise<string> => {
    return new Promise<string>((resolve) => {
      resolve('[RepositoryName]');
    });
  },
};
