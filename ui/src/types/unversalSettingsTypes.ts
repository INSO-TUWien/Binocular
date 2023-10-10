import { IAuthor, ICommitter, IPalette } from './authorTypes';
import { IDateRange } from './globalTypes';
import { ISprint } from './sprintTypes';
import { IBoundsCommit, IBoundsIssue } from './boundsTypes';

export interface IUniversalSettingsConfig {
  hideDateSettings?: boolean;
  hideGranularitySettings?: boolean;
  hideCommitSettings?: boolean;
  hideSprintSettings?: boolean;
}

export interface IUniversalSettings {
  allAuthors?: IPalette;
  chartResolution: string;
  chartTimeSpan: IDateRange;
  excludeMergeCommits: boolean;
  mergedAuthors: IAuthor[];
  otherAuthors: ICommitter[];
  selectedAuthorsGlobal: string[];
  sprints: ISprint[];
  universalSettingsData?: { data: IUniversalSettingsData; isFetching: boolean; receivedAt: any };
  initialized?: boolean;
}

export interface IUniversalSettingsData {
  committers: string[];
  firstCommit: IBoundsCommit;
  lastCommit: IBoundsCommit;
  firstIssue: IBoundsIssue;
  lastIssue: IBoundsIssue;
  firstSignificantTimestamp: number;
  lastSignificantTimestamp: number;
  palette: IPalette;
}
