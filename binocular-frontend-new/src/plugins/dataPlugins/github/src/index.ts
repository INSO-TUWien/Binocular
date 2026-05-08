import Commits from './collections/commits.ts';
import type { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Users from './collections/users.ts';
import General from './collections/general.ts';
import MergeRequests from './collections/mergeRequests';
import Builds from './collections/builds.ts';
import Notes from './collections/notes.ts';
import Issues from './collections/issues.ts';
import Accounts from './collections/accounts.ts';
import Files from './collections/files.ts';
import CommitByFile from './collections/commitsFiles';
import AccountsIssues from './collections/accountsIssues';
import AccountsMergeRequests from './collections/accountsMergeRequests';
import Branches from './collections/branches';

class Github implements DataPlugin {
  public name = 'Github';
  public description = 'Connect directly to the github API.';
  public capabilities = ['authors', 'commits'];
  public experimental = true;
  public requirements = {
    apiKey: true,
    endpoint: false,
    file: false,
    progressUpdate: false,
  };
  public commits;
  public builds;
  public notes;
  public issues;
  public users;
  public accounts;
  public general;
  public mergeRequests;
  public files = Files;
  public commitByFile = CommitByFile;
  public accountsIssues = AccountsIssues;
  public accountsMergeRequests = AccountsMergeRequests;
  public branches = Branches;

  constructor() {
    this.commits = new Commits('', '');
    this.builds = new Builds(); // Not implemented (questionable if needed in future)
    this.notes = new Notes(); // Not implemented (questionable if needed in future)
    this.issues = new Issues(); // Not implemented (questionable if needed in future)
    this.accounts = new Accounts(); // Not implemented (questionable if needed in future)
    this.mergeRequests = new MergeRequests(); // Not implemented (questionable if needed in future)
    this.users = new Users('', '');
    this.general = new General('');
  }

  public async init(apiKey: string | undefined, endpoint: string | undefined) {
    console.log(`Init GitHub Backend with ApiKey: ${apiKey} and Endpoint ${endpoint}`);
    if (apiKey !== undefined) {
      this.commits = new Commits(apiKey, 'INSO-TUWien/Binocular');
      this.builds = new Builds(); // Not implemented (questionable if needed in future)
      this.notes = new Notes(); // Not implemented (questionable if needed in future)
      this.issues = new Issues(); // Not implemented (questionable if needed in future)
      this.accounts = new Accounts(); // Not implemented (questionable if needed in future)
      this.mergeRequests = new MergeRequests(); // Not implemented (questionable if needed in future)
      this.users = new Users(apiKey, 'INSO-TUWien/Binocular');
      this.general = new General('INSO-TUWien/Binocular');
    }
    return undefined;
  }

  public async clearRemains() {}
}

export default Github;
