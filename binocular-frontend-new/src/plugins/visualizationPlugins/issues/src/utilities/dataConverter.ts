import moment from 'moment/moment';
import { ParametersType } from '../../../../../types/parameters/parametersType.ts';
import chroma from 'chroma-js';
import _ from 'lodash';
import { AuthorType } from '../../../../../types/data/authorType.ts';
import { Properties } from '../../../../interfaces/visualizationPluginInterfaces/properties.ts';
import { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import { IssueSettings } from '../settings/settings.tsx';

interface IssueChartData {
  date: number;
  [signature: string]: number;
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

const IssueStatus = {
  OPEN: 'Open',
  OPENED: 'Opened',
  CLOSED: 'Closed',
};

const UNASSIGNED = 'unassigned';

export function convertToChartData(
  issues: DataPluginIssue[] | unknown[],
  props: Properties<IssueSettings, DataPluginIssue>,
): {
  chartData: IssueChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!issues || issues.length === 0) {
    return { chartData: [], palette: {}, scale: [] };
  }

  //Sort Issues after their build time in case they arnt sorted
  const sortedIssues = _.clone(issues as DataPluginIssue[]).sort(
    (c1, c2) => new Date(c1.createdAt).getTime() - new Date(c2.createdAt).getTime(),
  );

  const firstTimestamp = sortedIssues[0].createdAt;
  const lastTimestamp = sortedIssues[sortedIssues.length - 1].createdAt;

  const chartData: IssueChartData[] = [];
  const scale: number[] = [0, 0];
  const palette: Palette = {};
  let returnValue;
  if (sortedIssues.length > 0) {
    if (props.settings.splitIssuesPerAuthor) {
      returnValue = getDataByAuthors(
        props.parameters,
        props.settings.breakdown,
        firstTimestamp,
        lastTimestamp,
        sortedIssues,
        scale,
        palette,
        chartData,
        props.authorList,
      );
    } else {
      returnValue = getDataByStatus(
        props.parameters,
        props.settings.breakdown,
        firstTimestamp,
        lastTimestamp,
        sortedIssues,
        scale,
        palette,
        chartData,
      );
    }
  } else {
    return { chartData: [], palette: {}, scale: [] };
  }
  return returnValue;
}

function getDataByStatus(
  parameters: ParametersType,
  breakdown: boolean,
  firstTimestamp: string,
  lastTimestamp: string,
  sortedIssues: DataPluginIssue[],
  scale: number[],
  palette: Palette,
  chartData: IssueChartData[],
) {
  const data: Array<{ date: number; statsBySortingObject: { [signature: string]: { count: number } } }> = [];
  //---- STEP 1: AGGREGATE Issues GROUPED BY STATUS PER TIME INTERVAL ----
  const granularity = getGranularity(parameters.parametersGeneral.granularity);
  const curr = moment(firstTimestamp)
    .startOf(granularity.unit as moment.unitOfTime.StartOf)
    .subtract(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const end = moment(lastTimestamp)
    .endOf(granularity.unit as moment.unitOfTime.StartOf)
    .add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const totalIssuesPerStatus: { [status: string]: number } = {};

  if (breakdown) {
    totalIssuesPerStatus[IssueStatus.OPEN] = 0;
  } else {
    totalIssuesPerStatus[IssueStatus.OPENED] = 0;
    totalIssuesPerStatus[IssueStatus.CLOSED] = 0;
  }

  for (
    ;
    curr.isSameOrBefore(end);
    curr.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity),
      next.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity)
  ) {
    //Iterate through time buckets
    const currTimestamp = curr.toDate().getTime();
    const nextTimestamp = next.toDate().getTime();
    const obj: { date: number; statsBySortingObject: { [signature: string]: { count: number } } } = {
      date: currTimestamp,
      statsBySortingObject: {},
    }; //Save date of time bucket, create object
    for (let i = 0; i < sortedIssues.length; i++) {
      if (Date.parse(sortedIssues[i].createdAt) >= currTimestamp && Date.parse(sortedIssues[i].createdAt) < nextTimestamp) {
        if (breakdown) {
          totalIssuesPerStatus[IssueStatus.OPEN] += 1;

          obj.statsBySortingObject[IssueStatus.OPEN] = { count: totalIssuesPerStatus[IssueStatus.OPEN] };
        } else {
          totalIssuesPerStatus[IssueStatus.OPENED] += 1;

          if (IssueStatus.OPENED in obj.statsBySortingObject) {
            obj.statsBySortingObject[IssueStatus.OPENED].count += 1;
          } else {
            obj.statsBySortingObject[IssueStatus.OPENED] = { count: 1 };
          }
        }
      }
      if (Date.parse(sortedIssues[i].closedAt) >= currTimestamp && Date.parse(sortedIssues[i].closedAt) < nextTimestamp) {
        if (breakdown) {
          totalIssuesPerStatus[IssueStatus.OPEN] -= 1;
          obj.statsBySortingObject[IssueStatus.OPEN] = { count: totalIssuesPerStatus[IssueStatus.OPEN] };
        } else {
          totalIssuesPerStatus[IssueStatus.CLOSED] += 1;

          if (IssueStatus.CLOSED in obj.statsBySortingObject) {
            obj.statsBySortingObject[IssueStatus.CLOSED].count -= 1;
          } else {
            obj.statsBySortingObject[IssueStatus.CLOSED] = { count: -1 };
          }
        }
      }
      if (breakdown) {
        if (!(IssueStatus.OPEN in obj.statsBySortingObject)) {
          obj.statsBySortingObject[IssueStatus.OPEN] = { count: totalIssuesPerStatus[IssueStatus.OPEN] };
        }
      } else {
        if (!(IssueStatus.OPENED in obj.statsBySortingObject)) {
          obj.statsBySortingObject[IssueStatus.OPENED] = { count: 0 };
        }
        if (!(IssueStatus.CLOSED in obj.statsBySortingObject)) {
          obj.statsBySortingObject[IssueStatus.CLOSED] = { count: 0 };
        }
      }
      data.push(obj);
    }
  }

  //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED Issues ----
  if (breakdown) {
    palette[IssueStatus.OPEN] = { main: chroma('#007AFF').hex(), secondary: chroma('#007AFF99').hex() };
  } else {
    palette[IssueStatus.OPENED] = { main: chroma('#007AFF').hex(), secondary: chroma('#007AFF99').hex() };
    palette[IssueStatus.CLOSED] = { main: chroma('#0062cc').hex(), secondary: chroma('#0062cc99').hex() };
  }

  data.forEach((issue) => {
    //build has structure {date, statsByStatus: {}} (see next line)}
    const obj: IssueChartData = { date: issue.date };

    for (const status of Object.values(IssueStatus)) {
      obj[status] = 0;
    }

    Object.values(IssueStatus).forEach((status) => {
      if (status in issue.statsBySortingObject) {
        obj[status] = issue.statsBySortingObject[status].count;
      }
    });
    chartData.push(obj); //Add object to list of objects
  });
  //Output in chartData has format [{author1: 123, author2: 123, ...}, ...],
  //e.g. series names are the authors with their corresponding values

  //---- STEP 3: SCALING ----
  chartData.forEach((dataPoint) => {
    let positiveTotals = 0;
    let negativeTotals = 0;
    Object.keys(dataPoint)
      .splice(1)
      .forEach((key) => {
        if (key.includes(IssueStatus.OPENED) || key.includes(IssueStatus.OPEN)) {
          positiveTotals += dataPoint[key];
        } else {
          negativeTotals += dataPoint[key];
        }
      });
    if (positiveTotals > scale[1]) {
      scale[1] = positiveTotals;
    }
    if (negativeTotals < scale[0]) {
      scale[0] = negativeTotals;
    }
  });

  return { chartData: chartData, scale: scale, palette: palette };
}

function getDataByAuthors(
  parameters: ParametersType,
  _breakdown: boolean,
  firstTimestamp: string,
  lastTimestamp: string,
  sortedIssues: DataPluginIssue[],
  scale: number[],
  palette: Palette,
  chartData: IssueChartData[],
  authors: AuthorType[],
) {
  const data: Array<{ date: number; statsBySortingObject: { [signature: string]: { OPENED: number; CLOSED: number } } }> = [];
  //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
  const granularity = getGranularity(parameters.parametersGeneral.granularity);
  const curr = moment(firstTimestamp)
    .startOf(granularity.unit as moment.unitOfTime.StartOf)
    .subtract(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const end = moment(lastTimestamp)
    .endOf(granularity.unit as moment.unitOfTime.StartOf)
    .add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const totalIssuesPerAuthor: { [signature: string]: number } = {};
  for (
    ;
    curr.isSameOrBefore(end);
    curr.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity),
      next.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity)
  ) {
    //Iterate through time buckets
    const currTimestamp = curr.toDate().getTime();
    const nextTimestamp = next.toDate().getTime();
    const obj: { date: number; statsBySortingObject: { [signature: string]: { OPENED: number; CLOSED: number } } } = {
      date: currTimestamp,
      statsBySortingObject: {},
    }; //Save date of time bucket, create object
    for (let i = 0; i < sortedIssues.length; i++) {
      if (Date.parse(sortedIssues[i].createdAt) >= currTimestamp && Date.parse(sortedIssues[i].createdAt) < nextTimestamp) {
        let assignee = 'unassigned';
        if (sortedIssues[i].assignee !== null) {
          assignee = sortedIssues[i].assignee.login;
        }

        if (totalIssuesPerAuthor[assignee] === null) {
          totalIssuesPerAuthor[assignee] = 0;
        }
        totalIssuesPerAuthor[assignee] += 1;

        if (IssueStatus.OPENED in obj.statsBySortingObject) {
          obj.statsBySortingObject[assignee] = {
            OPENED: obj.statsBySortingObject[assignee].OPENED + 1,
            CLOSED: obj.statsBySortingObject[assignee].CLOSED,
          };
        } else {
          obj.statsBySortingObject[assignee] = { OPENED: 1, CLOSED: 0 };
        }
      }
      if (Date.parse(sortedIssues[i].closedAt) >= currTimestamp && Date.parse(sortedIssues[i].closedAt) < nextTimestamp) {
        let assignee = UNASSIGNED;
        if (sortedIssues[i].assignee !== null) {
          assignee = sortedIssues[i].assignee.login;
        }

        if (totalIssuesPerAuthor[assignee] === null) {
          totalIssuesPerAuthor[assignee] = 0;
        }
        totalIssuesPerAuthor[assignee] += 1;

        if (IssueStatus.CLOSED in obj.statsBySortingObject) {
          obj.statsBySortingObject[assignee] = {
            OPENED: obj.statsBySortingObject[assignee].OPENED,
            CLOSED: obj.statsBySortingObject[assignee].CLOSED - 1,
          };
        } else {
          obj.statsBySortingObject[assignee] = { OPENED: 0, CLOSED: -1 };
        }
      }
    }
    data.push(obj);
  }

  //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED COMMITS ----
  palette['Opened Issues ' + UNASSIGNED] = { main: '#555555', secondary: '#777777' };
  palette['Closed Issues ' + UNASSIGNED] = { main: '#444444', secondary: '#666666' };
  data.forEach((issue) => {
    //commit has structure {date, statsByAuthor: {}} (see next line)}
    const obj: IssueChartData = { date: issue.date };

    for (const author of authors) {
      palette['Opened Issues ' + (author.displayName || author.user.gitSignature)] = {
        main: chroma(author.color.main).hex(),
        secondary: chroma(author.color.secondary).hex(),
      };
      palette['Closed Issues ' + (author.displayName || author.user.gitSignature)] = {
        main: chroma(author.color.main).darken(0.5).hex(),
        secondary: chroma(author.color.secondary).darken(0.5).hex(),
      };
      obj['Opened Issues ' + (author.displayName || author.user.gitSignature)] = 0;
      obj['Closed Issues ' + (author.displayName || author.user.gitSignature)] = 0;
    }
    obj['Opened Issues ' + UNASSIGNED] = 0;
    obj['Closed Issues ' + UNASSIGNED] = 0;

    authors.forEach((author) => {
      if (!author.selected) return;
      const name =
        author.parent === -1
          ? author.displayName || author.user.gitSignature
          : author.parent === 0
            ? 'others'
            : authors.filter((a) => a.id === author.parent)[0].user.gitSignature;

      if (author.user.id in issue.statsBySortingObject) {
        //Insert number of changes with the author name as key,
        //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
        if ('Opened Issues ' + name in obj && 'Failed Issues ' + name in obj) {
          obj['Opened Issues ' + name] += issue.statsBySortingObject[author.user.id].OPENED;
          obj['Closed Issues ' + name] += issue.statsBySortingObject[author.user.id].CLOSED;
        } else {
          obj['Opened Issues ' + name] = issue.statsBySortingObject[author.user.id].OPENED;
          obj['Closed Issues ' + name] = issue.statsBySortingObject[author.user.id].CLOSED;
        }
      }
    });
    if (UNASSIGNED in issue.statsBySortingObject) {
      if ('Opened Issues ' + UNASSIGNED in obj && 'Failed Issues ' + UNASSIGNED in obj) {
        obj['Opened Issues ' + UNASSIGNED] += issue.statsBySortingObject[UNASSIGNED].OPENED;
        //-0.001 for stack layout to realize it belongs on the bottom
        obj['Closed Issues ' + UNASSIGNED] += issue.statsBySortingObject[UNASSIGNED].CLOSED;
      } else {
        obj['Opened Issues ' + UNASSIGNED] = issue.statsBySortingObject[UNASSIGNED].OPENED;
        //-0.001 for stack layout to realize it belongs on the bottom
        obj['Closed Issues ' + UNASSIGNED] = issue.statsBySortingObject[UNASSIGNED].CLOSED;
      }
    }

    chartData.push(obj); //Add object to list of objects
  });
  //Output in chartData has format [{author1: 123, author2: 123, ...}, ...],
  //e.g. series names are the authors with their corresponding values

  //---- STEP 3: SCALING ----
  chartData.forEach((dataPoint) => {
    let positiveTotals = 0;
    let negativeTotals = 0;

    Object.keys(dataPoint)
      .splice(1)
      .forEach((key) => {
        if (key.includes('Opened Issues ')) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('Closed Issues ')) {
          negativeTotals += dataPoint[key];
        } else {
          positiveTotals += dataPoint[key];
        }
      });
    if (positiveTotals > scale[1]) {
      scale[1] = positiveTotals;
    }
    if (negativeTotals < scale[0]) {
      scale[0] = negativeTotals;
    }
  });

  return { chartData: chartData, scale: scale, palette: palette };
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
