import {
  DataPluginGeneral,
  DataPluginIndexer,
  DataPluginIndexerState,
} from '../../../interfaces/dataPluginInterfaces/dataPluginGeneral.ts';
//import {GraphQL} from "./utils.ts";

export default class General implements DataPluginGeneral {
  constructor() {}

  public getIndexer(): DataPluginIndexer {
    return { vcs: 'Mocked Data', its: 'Mocked Data', ci: 'Mocked Data' };
  }
  public getIndexerState(): DataPluginIndexerState {
    return DataPluginIndexerState.IDLE;
  }
  public getRepositoryName(): Promise<string> {
    return new Promise<string>((resolve) => {
      resolve('Mocked Repository');
    });
  }
}
