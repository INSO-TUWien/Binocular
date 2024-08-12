export interface DatabaseSettingsType {
  dataPlugin: DatabaseSettingsDataPulginType;
}

export interface DatabaseSettingsDataPulginType {
  name: string;
  parameters: {
    apiKey: string;
    endpoint: string;
  };
}
