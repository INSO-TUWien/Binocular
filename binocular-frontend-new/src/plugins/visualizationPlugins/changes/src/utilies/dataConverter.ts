import moment from 'moment/moment';
import { DataCommit } from '../../../../interfaces/dataPlugin.ts';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import chroma from 'chroma-js';
import { CommitChartData, Palette } from '../chart/chart.tsx';
import { ParametersInitialState } from '../../../../../redux/parameters/parametersReducer.ts';

export function convertCommitDataToChangesChartData(
  commits: DataCommit[],
  authors: AuthorType[],
  splitAdditionsDeletions: boolean,
  parameters: ParametersInitialState,
): {
  commitChartData: CommitChartData[];
  commitScale: number[];
  commitPalette: Palette;
} {
  if (!commits || commits.length === 0) {
    return { commitChartData: [], commitPalette: {}, commitScale: [] };
  }

  //Sort commits after their commit time in case they arnt sorted
  commits = commits.sort((c1, c2) => new Date(c1.date).getTime() - new Date(c2.date).getTime());

  const firstTimestamp = commits[0].date;
  const lastTimestamp = commits[commits.length - 1].date;

  //TODO: Filter and merge selected Authors

  const data: Array<{ date: number; statsByAuthor: { [signature: string]: { count: number; additions: number; deletions: number } } }> = [];
  const commitChartData: CommitChartData[] = [];
  const commitScale: number[] = [0, 0];
  const commitPalette: Palette = {};

  if (commits.length > 0) {
    //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----

    const granularity = getGranularity(parameters.parametersGeneral.granularity);
    const curr = moment(firstTimestamp)
      .startOf(granularity.unit as moment.unitOfTime.StartOf)
      .subtract(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
    const end = moment(lastTimestamp)
      .endOf(granularity.unit as moment.unitOfTime.StartOf)
      .add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
    const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
    const totalChangesPerAuthor: { [signature: string]: number } = {};
    for (
      let i = 0;
      curr.isSameOrBefore(end);
      curr.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity),
        next.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity)
    ) {
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
    if (splitAdditionsDeletions) {
      commitPalette['(Additions) others'] = { main: '#555555', secondary: '#777777' };
      commitPalette['(Deletions) others'] = { main: '#AAAAAA', secondary: '#CCCCCC' };
    } else {
      commitPalette['others'] = { main: '#555555', secondary: '#777777' };
    }
    data.forEach((commit) => {
      //commit has structure {date, statsByAuthor: {}} (see next line)}
      const obj: CommitChartData = { date: commit.date };

      if (splitAdditionsDeletions) {
        for (const author of authors) {
          commitPalette['(Additions) ' + author.name] = {
            main: chroma(author.color.main).hex(),
            secondary: chroma(author.color.secondary).hex(),
          };
          commitPalette['(Deletions) ' + author.name] = {
            main: chroma(author.color.main).darken(0.5).hex(),
            secondary: chroma(author.color.secondary).darken(0.5).hex(),
          };
          obj['(Additions) ' + author.name] = 0.001;
          obj['(Deletions) ' + author.name] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
        }
        obj['(Additions) others'] = 0;
        obj['(Deletions) others'] = -0.001;
      } else {
        for (const author of authors) {
          commitPalette[author.name] = {
            main: chroma(author.color.main).hex(),
            secondary: chroma(author.color.secondary).hex(),
          };
          obj[author.name] = 0;
        }
        obj['others'] = 0;
      }
      authors.forEach((author) => {
        if (!author.selected) return;
        const name =
          author.parent === -1 ? author.name : author.parent === 0 ? 'others' : authors.filter((a) => a.id === author.parent)[0].name;
        if (splitAdditionsDeletions) {
          if (author.name in commit.statsByAuthor) {
            //Insert number of changes with the author name as key,
            //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
            if ('(Additions) ' + name in obj && '(Deletions) ' + name in obj) {
              obj['(Additions) ' + name] += commit.statsByAuthor[author.name].additions;
              //-0.001 for stack layout to realize it belongs on the bottom
              obj['(Deletions) ' + name] += commit.statsByAuthor[author.name].deletions * -1 - 0.001;
            } else {
              obj['(Additions) ' + name] = commit.statsByAuthor[author.name].additions;
              //-0.001 for stack layout to realize it belongs on the bottom
              obj['(Deletions) ' + name] = commit.statsByAuthor[author.name].deletions * -1 - 0.001;
            }
          }
        } else {
          if (author.name in commit.statsByAuthor) {
            if (name in obj) {
              obj[name] += commit.statsByAuthor[author.name].additions + commit.statsByAuthor[author.name].deletions;
            } else {
              obj[name] = commit.statsByAuthor[author.name].additions + commit.statsByAuthor[author.name].deletions;
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
  return { commitChartData, commitScale, commitPalette };
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
