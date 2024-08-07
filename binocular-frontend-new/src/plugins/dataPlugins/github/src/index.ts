import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Users from './users.ts';
import General from './general.ts';
import Files from './files.ts';

class Github implements DataPlugin {
  public name = 'Github';
  public description = 'Connect directly to the github API!';
  public capabilities = ['authors', 'commits'];
  public experimental = true;
  public requirements = {
    apiKey: true,
    endpoint: false,
  };
  public commits;
  public users;
  public general;
  public files = Files;

  constructor() {
    this.commits = new Commits('', '');
    this.users = new Users('', '');
    this.general = new General('');
  }

  public setApiKey(apiKey: string) {
    this.commits = new Commits(apiKey, 'INSO-TUWIEN/Binocular');
    this.users = new Users(apiKey, 'INSO-TUWIEN/Binocular');
    this.general = new General('INSO-TUWIEN/Binocular');
  }
}

export default Github;
