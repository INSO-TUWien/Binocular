import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Authors from './authors.ts';

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
  public authors = Authors;

  constructor() {}

  public setApiKey() {}
}

export default BinocularBackend;
