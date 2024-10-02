import { DataPluginUser } from '../../plugins/interfaces/dataPluginInterfaces/dataPluginUsers.ts';

export interface AuthorType {
  user: DataPluginUser;
  id: number;
  parent: number;
  color: { main: string; secondary: string };
  selected: boolean;
  displayName?: string;
}
