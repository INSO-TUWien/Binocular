"use strict";

import { connect } from "react-redux";
import Chart from "./chart.tsx";
import { GlobalState } from "../../../../types/globalTypes.ts";
import moment from "moment";
import { Commit } from "../../../../types/commitTypes.ts";
import { Author, Committer, Palette } from "../../../../types/authorTypes.ts";

interface Props {
  chartResolution: moment.unitOfTime.DurationConstructor;
  commits: Commit[];
  filteredCommits: Commit[];
  committers: string[];
  excludeMergeCommits: boolean;
  excludedCommits: string[];
  excludeCommits: boolean;
  firstCommitTimestamp: number;
  lastCommitTimestamp: number;
  firstSignificantTimestamp: number;
  lastSignificantTimestamp: number;
  selectedBranch: string;
  commitType: string[];
  threshold: {
    hours: { lower: number; upper: number };
    change: { lower: number; upper: number };
    ratio: { lower: number; upper: number };
  };
  mergedAuthors: Author[];
  otherAuthors: Committer[];
  otherCount: number;
  palette: Palette;
  selectedAuthors: string[];
  searchTerm: string;
  firstCommitTime: number;
  maxSessionLength: number;
  useActualTime: boolean;
  useRatio: boolean;
}
const mapStateToProps = (state: GlobalState): Props => {
  const timeTrackingState = state.visualizations.commitTimeTracking.state;
  const universalSettings = state.universalSettings;
  return {
    palette: timeTrackingState.data.data.palette,
    otherCount: timeTrackingState.data.data.otherCount,
    filteredCommits: timeTrackingState.data.data.filteredCommits,
    commits: timeTrackingState.data.data.commits,
    committers: timeTrackingState.data.data.committers,
    firstCommitTimestamp: timeTrackingState.data.data.firstCommitTimestamp,
    lastCommitTimestamp: timeTrackingState.data.data.lastCommitTimestamp,
    firstSignificantTimestamp:
      timeTrackingState.data.data.firstSignificantTimestamp,
    lastSignificantTimestamp:
      timeTrackingState.data.data.lastSignificantTimestamp,
    selectedBranch: timeTrackingState.config.selectedBranch,
    commitType: timeTrackingState.config.commitType,
    threshold: timeTrackingState.config.threshold,
    selectedAuthors: universalSettings.selectedAuthorsGlobal,
    otherAuthors: universalSettings.otherAuthors,
    mergedAuthors: universalSettings.mergedAuthors,
    chartResolution: universalSettings.chartResolution,
    excludeMergeCommits: universalSettings.excludeMergeCommits,
    excludedCommits: universalSettings.excludedCommits,
    excludeCommits: universalSettings.excludeCommits,
    searchTerm: timeTrackingState.config.searchTerm,
    firstCommitTime: timeTrackingState.config.firstCommitTime,
    maxSessionLength: timeTrackingState.config.maxSessionLength,
    useActualTime: timeTrackingState.config.useActualTime,
    useRatio: timeTrackingState.config.useRatio,
  };
};
const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
