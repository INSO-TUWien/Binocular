export interface DatabaseSettingsType {
  dataPlugins: DatabaseSettingsDataPluginType[];
}

export interface DatabaseSettingsDataPluginType {
  id?: number;
  name: string;
  isDefault?: boolean;
  parameters: {
    apiKey?: string;
    endpoint?: string;
  };
}
