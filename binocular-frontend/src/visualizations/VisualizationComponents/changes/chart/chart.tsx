import * as React from 'react';
import * as d3 from 'd3';

import styles from '../styles.module.scss';
import _ from 'lodash';

import StackedAreaChart from '../../../../components/StackedAreaChart';
import moment from 'moment';
import chroma from 'chroma-js';
import { Author, Committer, Palette } from '../../../../types/authorTypes';
import { Commit } from '../../../../types/commitTypes';

interface Props {
  id: number;
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
  size: string;
  universalSettings: boolean;
}

interface CommitChartData {
  date: number;
  [signature: string]: number;
}

export default (props: Props) => {
  const extractedCommitData = extractCommitData(props);
  const [commitChartData, setCommitChartData] = React.useState(extractedCommitData.commitChartData);
  const [commitScale, setCommitScale] = React.useState(extractedCommitData.commitScale);
  const [commitPalette, setCommitPalette] = React.useState(extractedCommitData.commitPalette);
  const [selectedAuthors, setSelectedAuthors] = React.useState(extractedCommitData.selectedAuthors);

  React.useEffect(() => {
    const extractedCommitData = extractCommitData(props);
    setCommitChartData(extractedCommitData.commitChartData);
    setCommitScale(extractedCommitData.commitScale);
    setCommitPalette(extractedCommitData.commitPalette);
    setSelectedAuthors(extractedCommitData.selectedAuthors);
  }, [props]);

  let commitOffset, commitCenterAxis;

  if (props.displayMetric === 'linesChanged') {
    commitOffset = d3.stackOffsetDiverging;
    commitCenterAxis = true;
  } else {
    commitOffset = d3.stackOffsetNone;
    commitCenterAxis = false;
  }

  const commitChart = (
    <div className={styles.chartLine}>
      <div className={styles.chart}>
        {commitChartData !== undefined && commitChartData.length > 0 ? (
          <StackedAreaChart
            content={commitChartData}
            palette={commitPalette}
            paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
            xAxisCenter={commitCenterAxis}
            yDims={commitScale}
            d3offset={commitOffset}
            keys={selectedAuthors}
            resolution={props.chartResolution}
            displayNegative={true}
            order={Object.keys(commitPalette)}
          />
        ) : (
          <div className={styles.errorMessage}>No data during this time period!</div>
        )}
      </div>
    </div>
  );
  const loadingHint = (
    <div className={styles.loadingHintContainer}>
      <h1 className={styles.loadingHint}>
        Loading... <i className="fas fa-spinner fa-pulse" />
      </h1>
    </div>
  );

  return (
    <div className={styles.chartContainer}>
      {commitChartData === null && loadingHint}
      {commitChartData && commitChart}
    </div>
  );
};

const extractCommitData = (
  props: Props,
): { commitChartData: CommitChartData[]; commitScale: number[]; commitPalette: Palette; selectedAuthors: string[] } => {
  if (!props.commits || props.commits.length === 0) {
    return { commitChartData: [], commitPalette: {}, commitScale: [], selectedAuthors: [] };
  }
  let firstTimestamp = props.firstCommitTimestamp;
  let lastTimestamp = props.lastCommitTimestamp;
  let commits = props.commits;

  // explicitly check if the value is false, because in standalone mode, this is undefined.
  //   But then we also want the universal settings to have an effect
  // if this visualization is part of the dashboard, this value is either true or false
  if (props.universalSettings !== false) {
    commits = props.filteredCommits;
    firstTimestamp = props.firstSignificantTimestamp;
    lastTimestamp = props.lastSignificantTimestamp;
    if (props.excludeMergeCommits) {
      commits = commits.filter((c: Commit) => !c.message.includes('Merge'));
    }
    if (props.excludeCommits) {
      commits = commits.filter((c) => !props.excludedCommits.includes(c.sha));
    }
  }

  const data: Array<{ date: number; statsByAuthor: { [signature: string]: { count: number; additions: number; deletions: number } } }> = [];
  const selectedAuthors: string[] = [];
  const commitChartData: CommitChartData[] = [];
  const commitScale: number[] = [0, 0];
  const commitChartPalette: Palette = {};

  if (commits.length > 0) {
    //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
    //let granularity = Dashboard.getGranularity(props.resolution);
    const granularity = getGranularity(props.chartResolution);
    const curr = moment(firstTimestamp)
      .startOf(granularity.unit as moment.unitOfTime.StartOf)
      .subtract(1, props.chartResolution);
    const end = moment(lastTimestamp)
      .endOf(granularity.unit as moment.unitOfTime.StartOf)
      .add(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    const totalChangesPerAuthor: { [signature: string]: number } = {};
    for (let i = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj: { date: number; statsByAuthor: { [signature: string]: { count: number; additions: number; deletions: number } } } = {
        date: currTimestamp,
        statsByAuthor: {},
      }; //Save date of time bucket, create object
      for (; i < commits.length && Date.parse(commits[i].date) < nextTimestamp; i++) {
        //Iterate through commits that fall into this time bucket
        const additions = commits[i].stats.additions;
        const deletions = commits[i].stats.deletions;
        const changes = additions + deletions;
        const commitAuthor = commits[i].signature;
        if (totalChangesPerAuthor[commitAuthor] === null) {
          totalChangesPerAuthor[commitAuthor] = 0;
        }
        totalChangesPerAuthor[commitAuthor] += changes;
        if (
          commitAuthor in obj.statsByAuthor //If author is already in statsByAuthor, add to previous values
        ) {
          obj.statsByAuthor[commitAuthor] = {
            count: obj.statsByAuthor[commitAuthor].count + 1,
            additions: obj.statsByAuthor[commitAuthor].additions + additions,
            deletions: obj.statsByAuthor[commitAuthor].deletions + deletions,
          };
        } else {
          //Else create new values
          obj.statsByAuthor[commitAuthor] = { count: 1, additions: additions, deletions: deletions };
        }
      }
      data.push(obj);
    }

    //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED COMMITS ----
    const chartIsSplit = props.displayMetric === 'linesChanged';
    if (chartIsSplit) {
      commitChartPalette['(Additions) others'] = props.palette['others'];
      commitChartPalette['(Deletions) others'] = props.palette['others'];
    } else {
      commitChartPalette['others'] = props.palette['others'];
    }
    _.each(data, function (commit) {
      //commit has structure {date, statsByAuthor: {}} (see next line)}
      const obj: CommitChartData = { date: commit.date };

      if (chartIsSplit) {
        for (const mergedAuthor of props.mergedAuthors) {
          commitChartPalette['(Additions) ' + mergedAuthor.mainCommitter] = chroma(mergedAuthor.color).hex();
          commitChartPalette['(Deletions) ' + mergedAuthor.mainCommitter] = chroma(mergedAuthor.color).darken(0.5).hex();
          obj['(Additions) ' + mergedAuthor.mainCommitter] = 0.001;
          obj['(Deletions) ' + mergedAuthor.mainCommitter] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
        }
        obj['(Additions) others'] = 0;
        obj['(Deletions) others'] = -0.001;
      } else {
        for (const mergedAuthor of props.mergedAuthors) {
          commitChartPalette[mergedAuthor.mainCommitter] = chroma(mergedAuthor.color).hex();
          obj[mergedAuthor.mainCommitter] = 0;
        }
        obj['others'] = 0;
      }
      _.each(
        props.selectedAuthors.filter((sA: string) => sA !== 'other'),
        function (committer) {
          //commitLegend to iterate over authorNames, commitLegend has structure [{name, style}, ...]
          for (const mergedAuthor of props.mergedAuthors.filter((a: Author) => a.mainCommitter === committer)) {
            //If committer has data
            //Add additions and Deletions of merged Committers
            for (const c of mergedAuthor.committers) {
              if (chartIsSplit) {
                if (c.signature in commit.statsByAuthor) {
                  //Insert number of changes with the author name as key,
                  //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
                  if ('(Additions) ' + mergedAuthor.mainCommitter in obj && '(Deletions) ' + mergedAuthor.mainCommitter in obj) {
                    obj['(Additions) ' + mergedAuthor.mainCommitter] += commit.statsByAuthor[c.signature].additions;
                    //-0.001 for stack layout to realize it belongs on the bottom
                    obj['(Deletions) ' + mergedAuthor.mainCommitter] += commit.statsByAuthor[c.signature].deletions * -1 - 0.001;
                  } else {
                    obj['(Additions) ' + mergedAuthor.mainCommitter] = commit.statsByAuthor[c.signature].additions;
                    //-0.001 for stack layout to realize it belongs on the bottom
                    obj['(Deletions) ' + mergedAuthor.mainCommitter] = commit.statsByAuthor[c.signature].deletions * -1 - 0.001;
                  }
                }
              } else {
                if (c.signature in commit.statsByAuthor) {
                  if (mergedAuthor.mainCommitter in obj) {
                    obj[mergedAuthor.mainCommitter] += commit.statsByAuthor[c.signature].count;
                  } else {
                    obj[mergedAuthor.mainCommitter] = commit.statsByAuthor[c.signature].count;
                  }
                }
              }
            }
          }
        },
      );
      //Add other if selected
      if (props.selectedAuthors.includes('others')) {
        props.otherAuthors.forEach((c: Committer) => {
          if (chartIsSplit) {
            if (c.signature in commit.statsByAuthor) {
              //Insert number of changes with the author name as key,
              if ('(Additions) others' in obj && '(Deletions) others' in obj) {
                //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
                obj['(Additions) others'] += commit.statsByAuthor[c.signature].additions;
                //-0.001 for stack layout to realize it belongs on the bottom
                obj['(Deletions) others'] += commit.statsByAuthor[c.signature].deletions * -1 - 0.001;
              } else {
                //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
                obj['(Additions) others'] = commit.statsByAuthor[c.signature].additions;
                //-0.001 for stack layout to realize it belongs on the bottom
                obj['(Deletions) others'] = commit.statsByAuthor[c.signature].deletions * -1 - 0.001;
              }
            }
          } else {
            if (c.signature in commit.statsByAuthor) {
              if ('others' in obj) {
                obj['others'] += commit.statsByAuthor[c.signature].count;
              } else {
                obj['others'] = commit.statsByAuthor[c.signature].count;
              }
            }
          }
        });
      }
      commitChartData.push(obj); //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...],
    //e.g. series names are the authors with their corresponding values

    //---- STEP 3: SCALING ----
    _.each(commitChartData, (dataPoint) => {
      let positiveTotals = 0;
      let negativeTotals = 0;
      _.each(Object.keys(dataPoint).splice(1), (key) => {
        if (key.includes('(Additions) ') && props.selectedAuthors.indexOf(key.split(') ')[1]) > -1) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('(Deletions) ') && props.selectedAuthors.indexOf(key.split(') ')[1]) > -1) {
          negativeTotals += dataPoint[key];
        } else if (props.selectedAuthors.indexOf(key) > -1) {
          positiveTotals += dataPoint[key];
        }
      });
      if (positiveTotals > commitScale[1]) {
        commitScale[1] = positiveTotals;
      }
      if (negativeTotals < commitScale[0]) {
        commitScale[0] = negativeTotals;
      }
    });

    //---- STEP 4: FORMATTING FILTERS ----
    const keys = Object.keys(commitChartData[0]).splice(1);

    _.each(keys, (key) => {
      let concatKey = key;
      if (key.includes('(Additions) ') || key.includes('(Deletions) ')) {
        concatKey = key.split(') ')[1];
      }
      if (props.selectedAuthors.indexOf(concatKey) > -1) {
        selectedAuthors.push(key);
      }
    });
  }
  return { commitChartData, commitScale, commitPalette: commitChartPalette, selectedAuthors };
};

const getGranularity = (resolution: string): { interval: moment.Duration | number; unit: string } => {
  switch (resolution) {
    case 'years':
      return { interval: moment.duration(1, 'year'), unit: 'year' };
    case 'months':
      return { interval: moment.duration(1, 'month'), unit: 'month' };
    case 'weeks':
      return { interval: moment.duration(1, 'week'), unit: 'week' };
    case 'days':
      return { interval: moment.duration(1, 'day'), unit: 'day' };
    default:
      return { interval: 0, unit: '' };
  }
};
