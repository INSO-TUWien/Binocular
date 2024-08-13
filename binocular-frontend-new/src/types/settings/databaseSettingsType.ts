export interface DatabaseSettingsType {
  dataPlugins: DatabaseSettingsDataPluginType[];
}

export interface DatabaseSettingsDataPluginType {
  id?: number;
  name: string;
  color: string;
  isDefault?: boolean;
  parameters: {
    apiKey?: string;
    endpoint?: string;
  };
}
