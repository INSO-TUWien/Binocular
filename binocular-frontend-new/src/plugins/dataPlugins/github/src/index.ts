import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Authors from './authors.ts';

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

  constructor() {
    this.commits = new Commits('');
    this.authors = new Authors('');
  }

  public setApiKey(apiKey: string) {
    this.commits = new Commits(apiKey);
    this.authors = new Authors(apiKey);
  }
}

export default Github;
