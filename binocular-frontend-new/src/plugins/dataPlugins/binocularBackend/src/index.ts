import Commits from './commits.ts';
import { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import General from './general.ts';
import Files from './files.ts';
import Users from './users.ts';

class BinocularBackend implements DataPlugin {
  public name = 'Binocular Backend';
  public description = 'Connection to the Binocular GraphQL Backend!';
  public capabilities = ['authors', 'commits', 'files'];
  public experimental = false;
  public requirements = {
    apiKey: false,
    endpoint: true,
  };
  public commits;
  public users;
  public general;
  public files;

  constructor() {
    this.commits = new Commits('/graphQl');
    this.users = new Users('/graphQl');
    this.general = new General(/*'/graphQl'*/);
    this.files = new Files('/graphQl');
  }

  public init(apiKey: string | undefined, endpoint: string | undefined) {
    console.log(`Init Binocular Backend with ApiKey: ${apiKey} and Endpoint ${endpoint}`);
    if (endpoint === undefined || endpoint.length === 0) {
      endpoint = '/graphQl';
    }
    this.commits = new Commits(endpoint);
    this.users = new Users(endpoint);
    this.general = new General(/*endpoint*/);
    this.files = new Files(endpoint);
  }
}

export default BinocularBackend;
