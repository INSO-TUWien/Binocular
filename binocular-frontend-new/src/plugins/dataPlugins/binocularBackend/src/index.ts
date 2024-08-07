import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import General from './general.ts';
import Files from './files.ts';
import Users from './users.ts';

class BinocularBackend implements DataPlugin {
  public name = 'Binocular Backend';
  public description = 'Connection to the Binocular GraphQL Backend!';
  public capabilities = ['authors', 'commits'];
  public experimental = false;
  public requirements = {
    apiKey: false,
    endpoint: false,
  };
  public commits = Commits;
  public users = Users;
  public general = General;
  public files = Files;

  constructor() {}

  public setApiKey() {}
}

export default BinocularBackend;
