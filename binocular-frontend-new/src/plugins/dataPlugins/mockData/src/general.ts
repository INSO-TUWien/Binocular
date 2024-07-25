import { DataPluginIndexer, DataPluginIndexerState } from '../../../interfaces/dataPluginInterfaces/dataPluginGeneral.ts';

export default {
  getIndexer: (): DataPluginIndexer => {
    return { vcs: 'Mock', its: 'Mock', ci: 'Mock' };
  },
  getIndexerState: (): DataPluginIndexerState => {
    return DataPluginIndexerState.FINISHED;
  },
  getRepositoryName: (): Promise<string> => {
    return new Promise<string>((resolve) => {
      resolve('Mocked Repository');
    });
  },
};
