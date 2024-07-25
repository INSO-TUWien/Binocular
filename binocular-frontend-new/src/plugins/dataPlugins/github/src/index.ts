import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Authors from './authors.ts';
import General from './general.ts';

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
  public authors;
  public general;

  constructor() {
    this.commits = new Commits('', '');
    this.authors = new Authors('', '');
    this.general = new General('');
  }

  public setApiKey(apiKey: string) {
    this.commits = new Commits(apiKey, 'INSO-TUWIEN/Binocular');
    this.authors = new Authors(apiKey, 'INSO-TUWIEN/Binocular');
    this.general = new General('INSO-TUWIEN/Binocular');
  }
}

export default Github;
