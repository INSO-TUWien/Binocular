import { Author, Committer, Palette } from './authorTypes';
import { DateRange } from './globalTypes';
import { Sprint } from './sprintTypes';
import { BoundsCommit, BoundsIssue } from './boundsTypes';
import moment from 'moment/moment';

export interface UniversalSettingsConfig {
  hideDateSettings: boolean;
  hideGranularitySettings: boolean;
  hideCommitSettings: boolean;
  hideSprintSettings: boolean;
}

export interface UniversalSettings {
  allAuthors?: Palette;
  chartResolution: moment.unitOfTime.DurationConstructor;
  chartTimeSpan: DateRange;
  excludeMergeCommits: boolean;
  mergedAuthors: Author[];
  otherAuthors: Committer[];
  selectedAuthorsGlobal: string[];
  sprints: Sprint[];
  universalSettingsData?: { data: UniversalSettingsData; isFetching: boolean; receivedAt: any } | undefined;
  initialized: boolean;
}

export interface UniversalSettingsData {
  committers: string[];
  firstCommit: BoundsCommit;
  lastCommit: BoundsCommit;
  firstIssue: BoundsIssue;
  lastIssue: BoundsIssue;
  firstSignificantTimestamp: number;
  lastSignificantTimestamp: number;
  palette: Palette;
}
