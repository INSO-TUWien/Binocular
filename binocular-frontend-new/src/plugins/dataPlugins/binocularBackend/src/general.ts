import {
  DataPluginGeneral,
  DataPluginIndexer,
  DataPluginIndexerState,
} from '../../../interfaces/dataPluginInterfaces/dataPluginGeneral.ts';
//import {GraphQL} from "./utils.ts";

export default class General implements DataPluginGeneral {
  //private graphQl;

  constructor(/*endpoint: string*/) {
    //this.graphQl = new GraphQL(endpoint);
  }

  public getIndexer(): DataPluginIndexer {
    return { vcs: 'ArangoDB', its: 'ArangoDB', ci: 'ArangoDB' };
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
