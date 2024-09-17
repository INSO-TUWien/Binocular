import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Users from './users.ts';
import General from './general.ts';
import Files from './files.ts';

class MockData implements DataPlugin {
  public name = 'Mock Data';
  public description = 'Mocked Data for testing purposes.';
  public capabilities = ['authors', 'commits', 'files'];
  public experimental = false;
  public requirements = {
    apiKey: false,
    endpoint: false,
    file: false,
  };
  public commits;
  public users;
  public general;
  public files;

  constructor() {
    this.commits = new Commits();
    this.users = new Users();
    this.general = new General();
    this.files = new Files();
  }

  public async init() {}
}

export default MockData;
