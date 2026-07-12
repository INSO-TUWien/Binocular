import type { DataPluginLizard, DataPluginLizards } from '../../../../interfaces/dataPluginInterfaces/dataPluginLizards.ts';
import { findAll } from '../utils.ts';
import Database from '../database.ts';

export default class Lizards implements DataPluginLizards {
  private readonly database: Database | undefined;

  constructor(database: Database | undefined) {
    this.database = database;
  }

  public async getAll(): Promise<DataPluginLizard[]> {
    console.log('Getting Lizard Analysis');

    if (this.database && this.database.documentStore) {
      return findAll(this.database.documentStore, 'lizard_file_analysis').then((res: { docs: unknown[] }) => {
        return res.docs as DataPluginLizard[];
      });
    }

    return new Promise<DataPluginLizard[]>((resolve) => {
      resolve([]);
    });
  }
}
