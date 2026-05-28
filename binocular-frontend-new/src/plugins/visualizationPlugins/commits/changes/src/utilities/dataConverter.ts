import moment from 'moment/moment';
import chroma from 'chroma-js';
import _ from 'lodash';
import type { DataPluginCommit } from '../../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';
import { type AuthorType, resolveAuthorName } from '../../../../../../types/data/authorType.ts';
import type { ChangesSettings } from '../settings/settings.tsx';
import type { VisualizationPluginProperties } from '../../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';

interface CommitChartData {
  date: number;
  [signature: string]: number;
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

export function convertToChartData(
  commits: DataPluginCommit[],
  props: VisualizationPluginProperties<ChangesSettings, DataPluginCommit>,
): {
  chartData: CommitChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!commits || commits.length === 0) {
    return { chartData: [], palette: {}, scale: [] };
  }
  //Sort commits after their commit time in case they arent sorted
  const sortedCommits = _.clone(commits)
    .filter((c) => !props.parameters.parametersGeneral.excludeMergeCommits || !c.message.startsWith('Merge'))
    .sort((c1, c2) => new Date(c1.date).getTime() - new Date(c2.date).getTime());
  const activeFiles = props.fileList
    ? props.fileList
        .map((file) => {
          if (file.checked) return file.element.path;
        })
        .filter((file) => file)
    : [];

  const firstTimestamp = sortedCommits[0].date;
  const lastTimestamp = sortedCommits[sortedCommits.length - 1].date;

  const data: Array<{ date: number; statsByAuthor: { [signature: string]: { count: number; additions: number; deletions: number } } }> = [];
  const commitChartData: CommitChartData[] = [];
  const commitScale: number[] = [0, 0];
  const commitPalette: Palette = {};

  if (sortedCommits.length > 0) {
    //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----

    const granularity = getGranularity(props.parameters.parametersGeneral.granularity);
    const curr = moment(firstTimestamp)
      .startOf(granularity.unit as moment.unitOfTime.StartOf)
      .subtract(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
    const end = moment(lastTimestamp)
      .endOf(granularity.unit as moment.unitOfTime.StartOf)
      .add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
    const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
    const totalChangesPerAuthor: { [signature: string]: number } = {};
    for (
      let i = 0;
      curr.isSameOrBefore(end);
      curr.add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity),
        next.add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity)
    ) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj: { date: number; statsByAuthor: { [signature: string]: { count: number; additions: number; deletions: number } } } = {
        date: currTimestamp,
        statsByAuthor: {},
      }; //Save date of time bucket, create object
      for (; i < sortedCommits.length && Date.parse(sortedCommits[i].date) < nextTimestamp; i++) {
        const commitAuthor = sortedCommits[i].user.id;
        if (sortedCommits[i].files != undefined)
          for (const file of sortedCommits[i].files!.data) {
            if (file.stats == undefined || !activeFiles.includes(file.file.path)) continue;
            //Iterate through commits that fall into this time bucket
            const additions = file.stats.additions;
            const deletions = file.stats.deletions;
            const changes = additions + deletions;
            if (totalChangesPerAuthor[commitAuthor] === undefined) {
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
        else {
          // if we do not have the relevant data per file, we just sum up additions and deletions per commit
          const additions = sortedCommits[i].stats.additions;
          const deletions = sortedCommits[i].stats.deletions;
          const changes = additions + deletions;
          if (totalChangesPerAuthor[commitAuthor] === undefined) {
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
      }
      data.push(obj);
    }

    //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED COMMITS ----
    if (props.settings.splitAdditionsDeletions) {
      commitPalette['(Additions) others'] = { main: '#555555', secondary: '#777777' };
      commitPalette['(Deletions) others'] = { main: '#AAAAAA', secondary: '#CCCCCC' };
    } else {
      commitPalette['others'] = { main: '#555555', secondary: '#777777' };
    }
    data.forEach((commit) => {
      //commit has structure {date, statsByAuthor: {}} (see next line)}
      const obj: CommitChartData = { date: commit.date };

      if (props.settings.splitAdditionsDeletions) {
        for (const author of props.authorList.filter((a) => a.parent === -1)) {
          commitPalette['(Additions) ' + (author.displayName || author.user.gitSignature)] = {
            main: chroma(author.color.main).hex(),
            secondary: chroma(author.color.secondary).hex(),
          };
          commitPalette['(Deletions) ' + (author.displayName || author.user.gitSignature)] = {
            main: chroma(author.color.main).darken(0.5).hex(),
            secondary: chroma(author.color.secondary).darken(0.5).hex(),
          };
          obj['(Additions) ' + (author.displayName || author.user.gitSignature)] = 0.001;
          obj['(Deletions) ' + (author.displayName || author.user.gitSignature)] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
        }
        obj['(Additions) others'] = 0;
        obj['(Deletions) others'] = -0.001;
      } else {
        for (const author of props.authorList.filter((a) => a.parent === -1)) {
          commitPalette[author.displayName || author.user.gitSignature] = {
            main: chroma(author.color.main).hex(),
            secondary: chroma(author.color.secondary).hex(),
          };
          obj[author.displayName || author.user.gitSignature] = 0;
        }
        obj['others'] = 0;
      }
      props.authorList.forEach((author: AuthorType) => {
        if (!author.selected) return;
        const name = resolveAuthorName(author, props.authorList);
        if (props.settings.splitAdditionsDeletions) {
          if (author.user.id in commit.statsByAuthor) {
            //Insert number of changes with the author name as key,
            //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
            if ('(Additions) ' + name in obj && '(Deletions) ' + name in obj) {
              obj['(Additions) ' + name] += commit.statsByAuthor[author.user.id].additions;
              //-0.001 for stack layout to realize it belongs on the bottom
              obj['(Deletions) ' + name] += commit.statsByAuthor[author.user.id].deletions * -1 - 0.001;
            } else {
              obj['(Additions) ' + name] = commit.statsByAuthor[author.user.id].additions;
              //-0.001 for stack layout to realize it belongs on the bottom
              obj['(Deletions) ' + name] = commit.statsByAuthor[author.user.id].deletions * -1 - 0.001;
            }
          }
        } else {
          if (author.user.id in commit.statsByAuthor) {
            if (name in obj) {
              obj[name] += commit.statsByAuthor[author.user.id].additions + commit.statsByAuthor[author.user.id].deletions;
            } else {
              obj[name] = commit.statsByAuthor[author.user.id].additions + commit.statsByAuthor[author.user.id].deletions;
            }
          }
        }
      });

      commitChartData.push(obj); //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...],
    //e.g. series names are the authors with their corresponding values

    //---- STEP 3: SCALING ----
    commitChartData.forEach((dataPoint) => {
      let positiveTotals = 0;
      let negativeTotals = 0;
      Object.keys(dataPoint)
        .splice(1)
        .forEach((key) => {
          if (key.includes('(Additions) ')) {
            positiveTotals += dataPoint[key];
          } else if (key.includes('(Deletions) ')) {
            negativeTotals += dataPoint[key];
          } else {
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
  }
  return { chartData: commitChartData, scale: commitScale, palette: commitPalette };
}

function getGranularity(resolution: string): { unit: string; interval: moment.Duration } {
  switch (resolution) {
    case 'years':
      return { interval: moment.duration(1, 'year'), unit: 'year' };
    case 'months':
      return { interval: moment.duration(1, 'month'), unit: 'month' };
    case 'weeks':
      return { interval: moment.duration(1, 'week'), unit: 'week' };
    case 'days':
    default:
      return { interval: moment.duration(1, 'day'), unit: 'day' };
  }
}
