import type { DataPluginUser } from '../../plugins/interfaces/dataPluginInterfaces/dataPluginUsers.ts';

export interface AccountType {
  localId: number; // used in frontend only, generated during saving in accountLists
  id: string;
  login?: string;
  name: string;
  user: DataPluginUser | null;
  platform: string;
}
