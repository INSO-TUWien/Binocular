import Commits from './collections/commits.ts';
import type { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import General from './collections/general.ts';
import Files from './collections/files.ts';
import Users from './collections/users.ts';
import { type FileConfig } from '../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';
import { type ProgressUpdateConfig } from '../../../../types/settings/databaseSettingsType.ts';
import Builds from './collections/builds.ts';
import Branches from './collections/branches.ts';
import Issues from './collections/issues.ts';
import Notes from './collections/notes.ts';
import Accounts from './collections/accounts.ts';
import MergeRequests from './collections/mergeRequests.ts';
import AccountsIssues from './collections/accounts-issues.ts';
import AccountsMergeRequests from './collections/accounts-merge-requests.ts';
import CommitsFiles from './collections/commitsFiles.ts';

class BinocularBackend implements DataPlugin {
  public name = 'Binocular Backend';
  public description = 'Connection to the Binocular GraphQL Backend.';
  public capabilities = ['Commits', 'Issues', 'Branches', 'Ownership', 'Author Behaviour', 'Statistics', 'Expertise'];
  public experimental = false;
  public requirements = {
    apiKey: false,
    endpoint: true,
    file: false,
    progressUpdate: true,
  };
  public commits;
  public builds;
  public users;
  public accounts;
  public issues;
  public mergeRequests;
  public notes;
  public general;
  public files;
  public commitByFile;
  public accountsIssues;
  public accountsMergeRequests;
  public branches;

  constructor() {
    this.commits = new Commits('/graphQl');
    this.builds = new Builds('/graphQl');
    this.users = new Users('/graphQl');
    this.accounts = new Accounts('/graphQl');
    this.issues = new Issues('/graphQl');
    this.mergeRequests = new MergeRequests('/graphQl');
    this.notes = new Notes('/graphQl');
    this.general = new General('/graphQl', undefined);
    this.files = new Files('/graphQl');
    this.branches = new Branches('/graphQl');
    this.accountsIssues = new AccountsIssues('/graphQl');
    this.accountsMergeRequests = new AccountsMergeRequests('/graphQl');
    this.commitByFile = new CommitsFiles('/graphQl');
  }

  public async init(
    apiKey: string | undefined,
    endpoint: string | undefined,
    _file: FileConfig | undefined,
    progressUpdateConfig: ProgressUpdateConfig | undefined,
  ) {
    console.log(`Init Binocular Backend with ApiKey: ${apiKey} and Endpoint ${endpoint}`);
    if (endpoint === undefined || endpoint.length === 0) {
      endpoint = '/graphQl';
    }
    this.commits = new Commits(endpoint);
    this.builds = new Builds(endpoint);
    this.users = new Users(endpoint);
    this.accounts = new Accounts(endpoint);
    this.issues = new Issues(endpoint);
    this.mergeRequests = new MergeRequests(endpoint);
    this.notes = new Notes(endpoint);
    this.general = new General(endpoint, progressUpdateConfig);
    this.files = new Files(endpoint);
    this.accountsIssues = new AccountsIssues(endpoint);
    this.accountsMergeRequests = new AccountsMergeRequests(endpoint);
    this.commitByFile = new CommitsFiles(endpoint);
    return undefined; // TODO when BE provides metadata
  }

  public async clearRemains() {}
}

export default BinocularBackend;
