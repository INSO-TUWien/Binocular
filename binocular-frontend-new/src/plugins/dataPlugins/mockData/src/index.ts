import Commits from './collections/commits.ts';
import { type DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Users from './collections/users.ts';
import General from './collections/general.ts';
import Files from './collections/files.ts';
import Builds from './collections/builds.ts';
import Issues from './collections/issues.ts';
import Notes from './collections/notes.ts';
import Accounts from './collections/accounts.ts';
import Branches from './collections/branches.ts';
import MergeRequests from './collections/mergeRequests.ts';
import AccountsIssues from './collections/accounts-issues.ts';
import AccountsMergeRequests from './collections/accounts-merge-requests.ts';
import CommitsFiles from './collections/commitsFiles.ts';

class MockData implements DataPlugin {
  public name = 'Mock Data';
  public description = 'Mocked Data for testing purposes.';
  public capabilities = ['authors', 'commits', 'files', 'issues', 'builds', 'collaboration'];
  public experimental = false;
  public requirements = {
    apiKey: false,
    endpoint: false,
    file: false,
    progressUpdate: false,
  };
  public commits;
  public builds;
  public users;
  public accounts;
  public general;
  public files;
  public accountsIssues;
  public accountsMergeRequests;
  public branches;
  public issues;
  public mergeRequests;
  public notes;
  public commitByFile;

  constructor() {
    this.commits = new Commits();
    this.builds = new Builds();
    this.users = new Users();
    this.accounts = new Accounts();
    this.general = new General();
    this.files = new Files();
    this.commitByFile = new CommitsFiles();
    this.branches = new Branches();
    this.issues = new Issues();
    this.mergeRequests = new MergeRequests();
    this.notes = new Notes();
    this.accountsIssues = new AccountsIssues();
    this.accountsMergeRequests = new AccountsMergeRequests();
  }

  public async init() {
    return undefined;
  }

  public async clearRemains() {}
}

export default MockData;
