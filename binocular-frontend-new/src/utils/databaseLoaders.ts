// #v-ifdef PRE_CONFIGURE_DB=='pouchdb'
import {
  addDataPlugin,
  LocalDatabaseLoadingState,
  setLocalDatabaseLoadingMessage,
  setLocalDatabaseLoadingState,
} from '../redux/reducer/settings/settingsReducer.ts';
import type { AppDispatch } from '../redux';
import { PouchDB } from '../plugins/pluginRegistry.ts';
import Config from '../config.ts';
import type { DatabaseSettingsDataPluginType } from '../types/settings/databaseSettingsType.ts';
import type { SettingsInitialState } from '../redux/reducer/settings/settingsReducer.ts';

/**
 * Imports when Frontends gets build with arangodb preloaded.
 * These imports are allowed to fail during a normal build.
 */
import branches from '../db_export/branches.json';
import branchesFiles from '../db_export/branches-files.json';
import branchesFilesFiles from '../db_export/branches-files-files.json';
import builds from '../db_export/builds.json';
import commitsCommits from '../db_export/commits-commits.json';
import commitsFiles from '../db_export/commits-files.json';
import commitsBuilds from '../db_export/commits-builds.json';
import commitsFilesUsers from '../db_export/commits-files-users.json';
import commitsModules from '../db_export/commits-modules.json';
import commitsUsers from '../db_export/commits-users.json';
import commits from '../db_export/commits.json';
import files from '../db_export/files.json';
import issuesCommits from '../db_export/issues-commits.json';
import issues from '../db_export/issues.json';
import modulesFiles from '../db_export/modules-files.json';
import modulesModules from '../db_export/modules-modules.json';
import modules from '../db_export/modules.json';
import users from '../db_export/users.json';
import mergeRequests from '../db_export/mergeRequests.json';
import milestones from '../db_export/milestones.json';
import issuesMilestones from '../db_export/issues-milestones.json';
import mergeRequestsMilestones from '../db_export/mergeRequests-milestones.json';
import accounts from '../db_export/accounts.json';
import issuesAccounts from '../db_export/issues-accounts.json';
import mergeRequestsAccounts from '../db_export/mergeRequests-accounts.json';
import notes from '../db_export/notes.json';
import issuesNotes from '../db_export/issues-notes.json';
import mergeRequestsNotes from '../db_export/mergeRequests-notes.json';
import notesAccounts from '../db_export/notes-accounts.json';
import accountsUsers from '../db_export/accounts-users.json';
import metadataJson from '../db_export/metadata.json';
import type { JSONObject } from '../plugins/interfaces/dataPluginInterfaces/dataPluginFiles.ts';
import type { MetadataType } from '../types/data/MetadataType.ts';

const metadata: MetadataType = metadataJson;

const dbObjects: { [key: string]: JSONObject[] } = {
  branches: branches,
  'branches-files': branchesFiles,
  'branches-files-files': branchesFilesFiles,
  builds: builds,
  'commits-commits': commitsCommits,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  'commits-files': commitsFiles,
  'commits-builds': commitsBuilds,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  'commits-files-users': commitsFilesUsers,
  'commits-modules': commitsModules,
  'commits-users': commitsUsers,
  commits: commits,
  files: files,
  'issues-commits': issuesCommits,
  issues: issues,
  'modules-files': modulesFiles,
  'modules-modules': modulesModules,
  modules: modules,
  users: users,
  mergeRequests: mergeRequests,
  milestones: milestones,
  'issues-milestones': issuesMilestones,
  'mergeRequests-milestones': mergeRequestsMilestones,
  accounts: accounts,
  'issues-accounts': issuesAccounts,
  notes: notes,
  'mergeRequests-accounts': mergeRequestsAccounts,
  'issues-notes': issuesNotes,
  'mergeRequests-notes': mergeRequestsNotes,
  'notes-accounts': notesAccounts,
  'accounts-users': accountsUsers,
};

export default abstract class DatabaseLoaders {
  public static async loadJsonFilesToPouchDB(dispatch: AppDispatch): Promise<void> {
    // Check for existing plugin with same namespace
    const storedState = localStorage.getItem(`settingsStateV${Config.localStorageVersion}`);
    const settings: SettingsInitialState | null = storedState ? JSON.parse(storedState) : null;
    const existingPlugin = settings?.database.dataPlugins.find(
      (dp: DatabaseSettingsDataPluginType) => dp.name === 'PouchDb' && dp.parameters.fileName === metadata.namespace,
    );

    // Skip if existing is same or newer
    if (existingPlugin?.metadata?.createdAt && new Date(existingPlugin.metadata.createdAt) >= new Date(metadata.createdAt)) {
      console.log(`Skipping preloaded PouchDB: existing is same or newer than preloaded (${metadata.createdAt})`);
      dispatch(setLocalDatabaseLoadingState(LocalDatabaseLoadingState.none));
      return;
    }

    // Clear old data only if updating an existing plugin
    if (existingPlugin) {
      console.log(`Updating PouchDB: preloaded (${metadata.createdAt}) is newer than existing`);
      await PouchDB.clearRemains();
    } else {
      console.log(`Loading preconfigured PouchDB from ${metadata.namespace} created at ${metadata.createdAt}`);
    }

    dispatch(setLocalDatabaseLoadingState(LocalDatabaseLoadingState.loading));
    try {
      await PouchDB.init(
        undefined,
        undefined,
        { name: metadata.namespace, file: undefined, dbObjects: dbObjects },
        undefined,
        (message) => {
          dispatch(setLocalDatabaseLoadingMessage(message));
        },
      );

      dispatch(
        addDataPlugin({
          name: 'PouchDb',
          color: existingPlugin?.color ?? '#8cadfc',
          id: existingPlugin?.id ?? 0,
          isDefault: existingPlugin?.isDefault ?? true,
          parameters: {
            apiKey: undefined,
            endpoint: undefined,
            fileName: metadata.namespace,
            progressUpdate: undefined,
          },
          metadata: metadata,
        }),
      );
      dispatch(setLocalDatabaseLoadingState(LocalDatabaseLoadingState.none));
      dispatch({ type: 'REFRESH_PLUGIN', payload: { pluginId: existingPlugin?.id ?? 0 } });
    } catch (e) {
      console.error('Failed to load preloaded PouchDB:', e);
      dispatch(setLocalDatabaseLoadingState(LocalDatabaseLoadingState.none));
    }
  }
}
// #v-endif
