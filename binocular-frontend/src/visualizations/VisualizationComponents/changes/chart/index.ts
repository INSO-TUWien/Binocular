'use strict';

import { connect } from 'react-redux';
import Chart from './chart';
import { GlobalState } from '../../../../types/globalTypes';
import moment from 'moment/moment';
import { Commit } from '../../../../types/commitTypes';
import { Author, Committer, Palette } from '../../../../types/authorTypes';

interface Props {
  chartResolution: moment.unitOfTime.DurationConstructor;
  commits: Commit[];
  filteredCommits: Commit[];
  committers: string[];
  displayMetric: string;
  excludeMergeCommits: boolean;
  excludedCommits: string[];
  excludeCommits: boolean;
  firstCommitTimestamp: number;
  lastCommitTimestamp: number;
  firstSignificantTimestamp: number;
  lastSignificantTimestamp: number;
  mergedAuthors: Author[];
  otherAuthors: Committer[];
  otherCount: number;
  palette: Palette;
  selectedAuthors: string[];
}
const mapStateToProps = (state: GlobalState): Props => {
  const changesState = state.visualizations.changes.state;
  const universalSettings = state.universalSettings;
  return {
    palette: changesState.data.data.palette,
    otherCount: changesState.data.data.otherCount,
    filteredCommits: changesState.data.data.filteredCommits,
    commits: changesState.data.data.commits,
    committers: changesState.data.data.committers,
    firstCommitTimestamp: changesState.data.data.firstCommitTimestamp,
    lastCommitTimestamp: changesState.data.data.lastCommitTimestamp,
    firstSignificantTimestamp: changesState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp: changesState.data.data.lastSignificantTimestamp,
    displayMetric: changesState.config.displayMetric,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    otherAuthors: universalSettings.otherAuthors,
    mergedAuthors: universalSettings.mergedAuthors,
    chartResolution: universalSettings.chartResolution,
    excludeMergeCommits: universalSettings.excludeMergeCommits,
    excludedCommits: universalSettings.excludedCommits,
    excludeCommits: universalSettings.excludeCommits,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
