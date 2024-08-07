import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Users from './users.ts';
import General from './general.ts';
import Files from './files.ts';

class MockData implements DataPlugin {
  public name = 'Mock Data';
  public description = 'Mocked Data for testing purposes!';
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

export default MockData;
