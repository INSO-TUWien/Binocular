import { DataPlugin } from '../plugins/interfaces/dataPlugin.ts';
import { DatabaseSettingsDataPluginType } from '../types/settings/databaseSettingsType.ts';
import { dataPlugins } from '../plugins/pluginRegistry.ts';

export default abstract class DataPluginStorage {
  private static configuredDataPlugins: { [nameId: string]: DataPlugin } = {};

  public static addDataPlugin(dP: DatabaseSettingsDataPluginType) {
    if (dP.id !== undefined) {
      const dataPlugin = this.createDataPluginObject(dP);
      if (dataPlugin) {
        this.configuredDataPlugins[dP.name + dP.id] = dataPlugin;
      }
    }
  }

  public static getDataPlugin(dP: DatabaseSettingsDataPluginType) {
    if (dP.id !== undefined) {
      const configuredDataPlugin = this.configuredDataPlugins[dP.id];
      if (configuredDataPlugin) {
        return configuredDataPlugin;
      } else {
        const dataPlugin = this.createDataPluginObject(dP);
        if (dataPlugin) {
          this.configuredDataPlugins[dP.name + dP.id] = dataPlugin;
          return dataPlugin;
        }
      }
    }
    return undefined;
  }

  private static createDataPluginObject(dP: DatabaseSettingsDataPluginType) {
    const dataPlugin = dataPlugins.map((pluginClass) => new pluginClass()).filter((dataPlugin) => dataPlugin.name === dP.name)[0];
    if (dataPlugin && dP.id !== undefined) {
      dataPlugin.init(dP.parameters.apiKey, dP.parameters.endpoint);
      return dataPlugin;
    }
  }
}
