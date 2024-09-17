import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Users from './users.ts';
import General from './general.ts';
import Files from './files.ts';

class Github implements DataPlugin {
  public name = 'Github';
  public description = 'Connect directly to the github API.';
  public capabilities = ['authors', 'commits'];
  public experimental = true;
  public requirements = {
    apiKey: true,
    endpoint: false,
    file: false,
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

  // eslint-disable-next-line @typescript-eslint/require-await
  public async init(apiKey: string | undefined, endpoint: string | undefined) {
    console.log(`Init GitHub Backend with ApiKey: ${apiKey} and Endpoint ${endpoint}`);
    if (apiKey !== undefined) {
      this.commits = new Commits(apiKey, 'INSO-TUWien/Binocular');
      this.users = new Users(apiKey, 'INSO-TUWien/Binocular');
      this.general = new General('INSO-TUWien/Binocular');
    }
  }

  public async clearRemains() {
  }
}

export default Github;
