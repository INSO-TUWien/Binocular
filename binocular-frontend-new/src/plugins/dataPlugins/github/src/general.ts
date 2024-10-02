import {
  DataPluginGeneral,
  DataPluginIndexer,
  DataPluginIndexerState,
} from '../../../interfaces/dataPluginInterfaces/dataPluginGeneral.ts';

export default class General implements DataPluginGeneral {
  private owner;
  private name;
  constructor(endpoint: string) {
    this.owner = endpoint.split('/')[0];
    this.name = endpoint.split('/')[1];
  }
  public getIndexer(): DataPluginIndexer {
    return { vcs: 'GitHub', its: 'GitHub', ci: 'GitHub' };
  }

  public getIndexerState(): DataPluginIndexerState {
    //TODO: Check Connection to API
    return DataPluginIndexerState.CONNECTED;
  }

  public async getRepositoryName() {
    return new Promise<string>((resolve) => {
      resolve(`${this.owner}/${this.name}`);
    });
  }
}
