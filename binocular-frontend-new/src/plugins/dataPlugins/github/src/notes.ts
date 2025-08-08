import type { DataPluginNote, DataPluginNotes } from '../../../interfaces/dataPluginInterfaces/dataPluginNotes.ts';

export default class Notes implements DataPluginNotes {
  constructor() {}
  public async getAll() {
    return await Promise.resolve(this.getBuilds());
  }
  private async getBuilds(): Promise<DataPluginNote[]> {
    // TODO: find out if implementation is needed in any near future?
    await new Promise((resolve) => setTimeout(resolve, 10));
    return [];
  }
}
