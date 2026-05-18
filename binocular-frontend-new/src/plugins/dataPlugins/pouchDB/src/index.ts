import Commits from './collections/commits.ts';
import type { DataPlugin } from '../../../interfaces/dataPlugin.ts';
import Users from './collections/users.ts';
import General from './general.ts';
import Files from './collections/files.ts';
import Database from './database.ts';
import type { FileConfig } from '../../../interfaces/dataPluginInterfaces/dataPluginFiles.ts';
import type { ProgressUpdateConfig } from '../../../../types/settings/databaseSettingsType.ts';
import Builds from './collections/builds.ts';
import Notes from './collections/notes.ts';
import Issues from './collections/issues.ts';
import Accounts from './collections/accounts.ts';
import Branches from './collections/branches.ts';
import MergeRequests from './collections/mergeRequests.ts';
import AccountsIssues from './collections/accounts-issues';
import AccountsMergeRequests from './collections/accounts-merge-requests';
import CommitsFiles from './collections/commitsFiles';
import { VisualizationPluginMetadataCategory } from '../../../interfaces/visualizationPluginInterfaces/visualizationPluginMetadata.ts';

class PouchDb implements DataPlugin {
  public name = 'PouchDb';
  public description =
    'PouchDB browser based database that is able to import a database exported by Binocular packed as a Zip File. It is also possible to pre compile this database into Binocular through the frontend build process.';
  public capabilities = [
    VisualizationPluginMetadataCategory.Commits,
    VisualizationPluginMetadataCategory.Issues,
    VisualizationPluginMetadataCategory.Ownership,
    VisualizationPluginMetadataCategory.AuthorBehaviour,
    VisualizationPluginMetadataCategory.Statistics,
    VisualizationPluginMetadataCategory.Expertise,
  ];
  public experimental = false;
  public requirements = {
    apiKey: false,
    endpoint: false,
    file: true,
    progressUpdate: false,
  };
  public commits;
  public builds;
  public users;
  public accounts;
  public general;
  public files;
  public branches;
  public notes;
  public issues;
  public accountsIssues;
  public accountsMergeRequests;
  public mergeRequests;
  public commitByFile;

  private readonly database;

  constructor() {
    this.commits = new Commits(undefined);
    this.builds = new Builds(undefined);
    this.notes = new Notes(undefined);
    this.issues = new Issues(undefined);
    this.mergeRequests = new MergeRequests(undefined);
    this.users = new Users(undefined);
    this.accounts = new Accounts(undefined);
    this.general = new General();
    this.files = new Files(undefined);
    this.database = new Database();
    this.branches = new Branches(undefined);
    this.accountsIssues = new AccountsIssues(undefined);
    this.accountsMergeRequests = new AccountsMergeRequests(undefined);
    this.commitByFile = new CommitsFiles(); // not yet implemented
  }

  public async init(
    _apiKey: string | undefined,
    _endpoint: string | undefined,
    file: FileConfig | undefined,
    _progressUpdateConfig: ProgressUpdateConfig | undefined,
    setUploadInfo?: (message: string) => void | undefined,
  ) {
    if (file !== undefined) {
      const startTime = performance.now();
      const metadata = await this.database.initDB(file, startTime, setUploadInfo);
      this.commits = new Commits(this.database);
      this.builds = new Builds(this.database);
      this.notes = new Notes(this.database);
      this.issues = new Issues(this.database);
      this.mergeRequests = new MergeRequests(this.database);
      this.users = new Users(this.database);
      this.accounts = new Accounts(this.database);
      this.general = new General();
      this.files = new Files(this.database);
      this.branches = new Branches(this.database);
      this.accountsIssues = new AccountsIssues(this.database);
      this.accountsMergeRequests = new AccountsMergeRequests(this.database);
      return metadata || undefined;
    }
    return undefined;
  }

  public async clearRemains() {
    await this.database.delete();
  }

  public async export() {
    return this.database.export();
  }
}

export default PouchDb;
