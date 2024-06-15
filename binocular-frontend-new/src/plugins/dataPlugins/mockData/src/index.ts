import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Authors from './authors.ts';

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
  public authors = Authors;

  constructor() {}

  public setApiKey() {}
}

export default MockData;
