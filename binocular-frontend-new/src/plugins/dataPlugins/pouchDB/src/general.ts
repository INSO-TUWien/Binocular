import {
  DataPluginGeneral,
  DataPluginIndexer,
  DataPluginIndexerState,
} from '../../../interfaces/dataPluginInterfaces/dataPluginGeneral.ts';
//import {GraphQL} from "./database.ts";

export default class General implements DataPluginGeneral {
  constructor() {}

  public getIndexer(): DataPluginIndexer {
    return { vcs: 'PouchDB', its: 'PouchDB', ci: 'PouchDB' };
  }
  public getIndexerState(): DataPluginIndexerState {
    return DataPluginIndexerState.IDLE;
  }
  public getRepositoryName(): Promise<string> {
    return new Promise<string>((resolve) => {
      resolve('[RepositoryName]');
    });
  }
}
