import type { DataPlugin } from '../plugins/interfaces/dataPlugin.ts';
import type { DatabaseSettingsDataPluginType } from '../types/settings/databaseSettingsType.ts';
import { dataPlugins } from '../plugins/pluginRegistry.ts';

export default abstract class DataPluginStorage {
  private static configuredDataPlugins: { [nameId: string]: DataPlugin } = {};

  public static async addDataPlugin(dP: DatabaseSettingsDataPluginType) {
    if (dP.id !== undefined) {
      const dataPlugin = await this.createDataPluginObject(dP);
      if (dataPlugin) {
        this.configuredDataPlugins[dP.name + dP.id] = dataPlugin;
      }
    }
  }

  public static async getDataPlugin(dP: DatabaseSettingsDataPluginType): Promise<DataPlugin | undefined> {
    if (dP.id !== undefined) {
      const configuredDataPlugin = this.configuredDataPlugins[dP.name + dP.id];
      if (configuredDataPlugin) {
        return configuredDataPlugin;
      } else {
        const dataPlugin = await this.createDataPluginObject(dP);
        if (dataPlugin) {
          this.configuredDataPlugins[dP.name + dP.id] = dataPlugin;
          return dataPlugin;
        }
      }
    }
    return undefined;
  }

  private static async createDataPluginObject(dP: DatabaseSettingsDataPluginType): Promise<DataPlugin> {
    const dataPlugin = dataPlugins.map((pluginClass) => new pluginClass()).filter((dataPlugin) => dataPlugin.name === dP.name)[0];
    if (dataPlugin && dP.id !== undefined) {
      await dataPlugin.init(
        dP.parameters.apiKey,
        dP.parameters.endpoint,
        { name: dP.parameters.fileName, file: undefined, dbObjects: undefined },
        dP.parameters.progressUpdate,
      );
      Object.defineProperty(dataPlugin, 'sumCommits', {
        get() {
          return this.commits;
        },
        enumerable: true,
        configurable: true,
      });
    }
    return dataPlugin;
  }
}
