import Builds from './visualizationPlugins/builds/builds';
import Changes from './visualizationPlugins/commits/changes/src/index.tsx';
import Issues from './visualizationPlugins/issues/issues';
import MergeRequests from './visualizationPlugins/issues/mergeRequests';
import TimeSpent from './visualizationPlugins/authorBehaviour/timeSpent';
import RepositoryStats from './visualizationPlugins/stats/repositoryStats';
import CodeOwnership from './visualizationPlugins/ownership/codeOwnership';
import FileChanges from './visualizationPlugins/commits/fileChanges';
import CommitByFile from './visualizationPlugins/commits/commitByFile';
import CollaborationVisualization from './visualizationPlugins/authorBehaviour/collaboration';
import KnowledgeRadar from './visualizationPlugins/expertise/knowledgeRadar';
import CodeExpertise from './visualizationPlugins/expertise/codeExpertise';
import RepositoryActivity from './visualizationPlugins/authorBehaviour/repositoryActivity';
import IssuesTimeline from './visualizationPlugins/issues/issuesTimeline';
import Burndown from './visualizationPlugins/issues/burndown';
import IssueLabels from './visualizationPlugins/issues/issueLabels';
import CodeHotspots from './visualizationPlugins/expertise/codeHotspots';
import SumCommits from './visualizationPlugins/commits/sumCommits';
import ChangeFrequency from './visualizationPlugins/changeFrequency/index.ts';

import ExampleComplex from './visualizationPlugins/example/exampleComplex';
import ExampleStats from './visualizationPlugins/example/exampleStats';
import ExampleVisualization from './visualizationPlugins/example/exampleVisualization';

import type { DataPluginCommit } from './interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import type { DataPluginBuild } from './interfaces/dataPluginInterfaces/dataPluginBuilds.ts';
import type { DataPluginIssue } from './interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import type { DataPluginNote } from './interfaces/dataPluginInterfaces/dataPluginNotes.ts';
import type { DataPluginMergeRequest } from './interfaces/dataPluginInterfaces/dataPluginMergeRequests';

import MockData from './dataPlugins/mockData';
import BinocularBackend from './dataPlugins/binocularBackend';
import Github from './dataPlugins/github';
import PouchDb from './dataPlugins/pouchDB';

import type { VisualizationPlugin } from './interfaces/visualizationPlugin.ts';
import createVisualizationPlugin from './visualizationPlugins/simpleVisualizationPlugin';
import type { IssueSettings } from './visualizationPlugins/issues/issues/src/settings/settings.tsx';
import type { BuildSettings } from './visualizationPlugins/builds/builds/src/settings/settings.tsx';
import type { TimeSpentSettings } from './visualizationPlugins/authorBehaviour/timeSpent/src/settings/settings.tsx';
import type { ChangesSettings } from './visualizationPlugins/commits/changes/src/settings/settings.tsx';
import type { MergeRequestsSettings } from './visualizationPlugins/issues/mergeRequests/src/settings/settings.tsx';

// should currently work for commits, but fetching the data is still hardcoded to one or the other
const changes = createVisualizationPlugin<ChangesSettings, DataPluginCommit>(Changes);
const builds = createVisualizationPlugin<BuildSettings, DataPluginBuild>(Builds);
const issues = createVisualizationPlugin<IssueSettings, DataPluginIssue>(Issues);
const mergeRequest = createVisualizationPlugin<MergeRequestsSettings, DataPluginMergeRequest>(MergeRequests);
const timeSpent = createVisualizationPlugin<TimeSpentSettings, DataPluginNote>(TimeSpent);

//The implicit type here has to be any because every Visualization plugin has a different settings type implied
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export const visualizationPlugins: VisualizationPlugin<any, any>[] = [
  changes,
  builds,
  issues,
  mergeRequest,
  timeSpent,
  IssuesTimeline,
  RepositoryStats,
  CodeOwnership,
  FileChanges,
  ExampleStats,
  ExampleVisualization,
  ExampleComplex,
  CommitByFile,
  CollaborationVisualization,
  KnowledgeRadar,
  CodeExpertise,
  RepositoryActivity,
  Burndown,
  CodeHotspots,
  SumCommits,
  ChangeFrequency,
  IssueLabels,
];

//Order = priority used when nothing selected by the user.
export const dataPlugins = [BinocularBackend, PouchDb, MockData, Github];

// Separate Export for PouchDB Plugin to streamline Database loading
export const PouchDB = new PouchDb();
