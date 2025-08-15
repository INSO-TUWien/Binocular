import moment from 'moment/moment';
import type { ParametersType } from '../../../../../types/parameters/parametersType.ts';
import chroma from 'chroma-js';
import _ from 'lodash';
import type { AuthorType } from '../../../../../types/data/authorType.ts';
import type { VisualizationPluginProperties } from '../../../../interfaces/visualizationPluginInterfaces/visualizationPluginProperties.ts';
import type { MergeRequestsSettings } from '../settings/settings.tsx';
import type { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';

interface MergeRequestChartData {
  date: number;
  [signature: string]: number;
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

const MergeRequestStatus = {
  OPEN: 'Open',
  OPENED: 'Opened',
  MERGED: 'Merged',
  CLOSED: 'Closed',
};

const UNASSIGNED = 'unassigned';
const ACCOUNT_NOT_ASSIGNED = 'account not assigned';

export function convertToChartData(
  mergeRequests: DataPluginMergeRequest[] | unknown[],
  props: VisualizationPluginProperties<MergeRequestsSettings, DataPluginMergeRequest>,
): {
  chartData: MergeRequestChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!mergeRequests || mergeRequests.length === 0) {
    return { chartData: [], palette: {}, scale: [] };
  }
  //Sort MergeRequests after their creation time in case they arnt sorted
  const sortedMergeRequests = _.clone(mergeRequests as DataPluginMergeRequest[]).sort(
    (c1, c2) => new Date(c1.createdAt).getTime() - new Date(c2.createdAt).getTime(),
  );

  const firstTimestamp = sortedMergeRequests[0].createdAt;
  const lastTimestamp = sortedMergeRequests[sortedMergeRequests.length - 1].createdAt;

  const chartData: MergeRequestChartData[] = [];
  const scale: number[] = [0, 0];
  const palette: Palette = {};
  let returnValue;
  if (sortedMergeRequests.length > 0) {
    if (props.settings.splitMergeRequestsPerAuthor) {
      returnValue = getDataByAuthors(
        props.parameters,
        props.settings.breakdown,
        firstTimestamp,
        lastTimestamp,
        sortedMergeRequests,
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
        sortedMergeRequests,
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
  sortedMergeRequests: DataPluginMergeRequest[],
  scale: number[],
  palette: Palette,
  chartData: MergeRequestChartData[],
) {
  const data: Array<{ date: number; statsBySortingObject: { [status: string]: { count: number } } }> = [];
  //---- STEP 1: AGGREGATE Merge Requests GROUPED BY STATUS PER TIME INTERVAL ----
  const granularity = getGranularity(parameters.parametersGeneral.granularity);
  const curr = moment(firstTimestamp)
    .startOf(granularity.unit as moment.unitOfTime.StartOf)
    .subtract(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const end = moment(lastTimestamp)
    .endOf(granularity.unit as moment.unitOfTime.StartOf)
    .add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const totalMRPerStatus: { [status: string]: number } = {};

  if (breakdown) {
    totalMRPerStatus[MergeRequestStatus.OPEN] = 0;
  } else {
    totalMRPerStatus[MergeRequestStatus.OPENED] = 0;
    totalMRPerStatus[MergeRequestStatus.MERGED] = 0;
    totalMRPerStatus[MergeRequestStatus.CLOSED] = 0;
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
    const obj: { date: number; statsBySortingObject: { [status: string]: { count: number } } } = {
      date: currTimestamp,
      statsBySortingObject: {},
    }; //Save date of time bucket, create object
    for (let i = 0; i < sortedMergeRequests.length; i++) {
      if (Date.parse(sortedMergeRequests[i].createdAt) >= currTimestamp && Date.parse(sortedMergeRequests[i].createdAt) < nextTimestamp) {
        if (breakdown) {
          totalMRPerStatus[MergeRequestStatus.OPEN] += 1;

          obj.statsBySortingObject[MergeRequestStatus.OPEN] = { count: totalMRPerStatus[MergeRequestStatus.OPEN] };
        } else {
          totalMRPerStatus[MergeRequestStatus.OPENED] += 1;

          if (MergeRequestStatus.OPENED in obj.statsBySortingObject) {
            obj.statsBySortingObject[MergeRequestStatus.OPENED].count += 1;
          } else {
            obj.statsBySortingObject[MergeRequestStatus.OPENED] = { count: 1 };
          }
        }
      }
      if (
        Date.parse(<string>sortedMergeRequests[i].closedAt) >= currTimestamp &&
        Date.parse(<string>sortedMergeRequests[i].closedAt) < nextTimestamp
      ) {
        if (breakdown) {
          totalMRPerStatus[MergeRequestStatus.OPEN] -= 1;
          obj.statsBySortingObject[MergeRequestStatus.OPEN] = { count: totalMRPerStatus[MergeRequestStatus.OPEN] };
        } else {
          if (sortedMergeRequests[i].state === 'MERGED') {
            totalMRPerStatus[MergeRequestStatus.MERGED] += 1;

            if (MergeRequestStatus.MERGED in obj.statsBySortingObject) {
              obj.statsBySortingObject[MergeRequestStatus.MERGED].count -= 1;
            } else {
              obj.statsBySortingObject[MergeRequestStatus.MERGED] = { count: -1 };
            }
          }
          if (sortedMergeRequests[i].state === 'CLOSED') {
            totalMRPerStatus[MergeRequestStatus.CLOSED] += 1;

            if (MergeRequestStatus.CLOSED in obj.statsBySortingObject) {
              obj.statsBySortingObject[MergeRequestStatus.CLOSED].count -= 1;
            } else {
              obj.statsBySortingObject[MergeRequestStatus.CLOSED] = { count: -1 };
            }
          }
        }
      }
      if (breakdown) {
        if (!(MergeRequestStatus.OPEN in obj.statsBySortingObject)) {
          obj.statsBySortingObject[MergeRequestStatus.OPEN] = { count: totalMRPerStatus[MergeRequestStatus.OPEN] };
        }
      } else {
        if (!(MergeRequestStatus.OPENED in obj.statsBySortingObject)) {
          obj.statsBySortingObject[MergeRequestStatus.OPENED] = { count: 0 };
        }
        if (!(MergeRequestStatus.MERGED in obj.statsBySortingObject)) {
          obj.statsBySortingObject[MergeRequestStatus.MERGED] = { count: 0 };
        }
        if (!(MergeRequestStatus.CLOSED in obj.statsBySortingObject)) {
          obj.statsBySortingObject[MergeRequestStatus.CLOSED] = { count: 0 };
        }
      }
      data.push(obj);
    }
  }

  //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED MergeRequest ----
  if (breakdown) {
    palette[MergeRequestStatus.OPEN] = { main: chroma('#007AFF').hex(), secondary: chroma('#007AFF99').hex() };
  } else {
    palette[MergeRequestStatus.OPENED] = { main: chroma('#007AFF').hex(), secondary: chroma('#007AFF99').hex() };
    palette[MergeRequestStatus.MERGED] = { main: chroma('#00cc66').hex(), secondary: chroma('#00cc6699').hex() };
    palette[MergeRequestStatus.CLOSED] = { main: chroma('#ff3300').hex(), secondary: chroma('#ff330099').hex() };
  }

  data.forEach((mergeRequest) => {
    //build has structure {date, statsByStatus: {}} (see next line)}
    const obj: MergeRequestChartData = { date: mergeRequest.date };

    for (const status of Object.values(MergeRequestStatus)) {
      obj[status] = 0;
    }

    Object.values(MergeRequestStatus).forEach((status) => {
      if (status in mergeRequest.statsBySortingObject) {
        obj[status] = mergeRequest.statsBySortingObject[status].count;
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
        if (key.includes(MergeRequestStatus.OPENED) || key.includes(MergeRequestStatus.OPEN)) {
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
  breakdown: boolean,
  firstTimestamp: string,
  lastTimestamp: string,
  sortedMergeRequest: DataPluginMergeRequest[],
  scale: number[],
  palette: Palette,
  chartData: MergeRequestChartData[],
  authors: AuthorType[],
) {
  const data: Array<{
    date: number;
    statsBySortingObject: { [signature: string]: { OPENED?: number; MERGED?: number; CLOSED?: number; OPEN?: number } };
  }> = [];
  //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
  const granularity = getGranularity(parameters.parametersGeneral.granularity);
  const curr = moment(firstTimestamp)
    .startOf(granularity.unit as moment.unitOfTime.StartOf)
    .subtract(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const end = moment(lastTimestamp)
    .endOf(granularity.unit as moment.unitOfTime.StartOf)
    .add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);
  const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity);

  const totalMergeRequestsPerAuthor: { [signature: string]: number } = {};

  for (
    ;
    curr.isSameOrBefore(end);
    curr.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity),
      next.add(1, <moment.unitOfTime.DurationConstructor>parameters.parametersGeneral.granularity)
  ) {
    //Iterate through time buckets
    const currTimestamp = curr.toDate().getTime();
    const nextTimestamp = next.toDate().getTime();
    const obj: {
      date: number;
      statsBySortingObject: {
        [signature: string]: { OPENED?: number; MERGED?: number; CLOSED?: number; OPEN?: number };
      };
    } = {
      date: currTimestamp,
      statsBySortingObject: {},
    }; //Save date of time bucket, create object
    for (let i = 0; i < sortedMergeRequest.length; i++) {
      let assignee = UNASSIGNED;
      if (sortedMergeRequest[i].assignee) {
        if (sortedMergeRequest[i].assignee?.user?.id) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          assignee = sortedMergeRequest[i].assignee.user.id;
        } else {
          assignee = ACCOUNT_NOT_ASSIGNED;
        }
      }
      if (Date.parse(sortedMergeRequest[i].createdAt) >= currTimestamp && Date.parse(sortedMergeRequest[i].createdAt) < nextTimestamp) {
        if (!(assignee in totalMergeRequestsPerAuthor)) {
          totalMergeRequestsPerAuthor[assignee] = 0;
        }
        totalMergeRequestsPerAuthor[assignee] += 1;
        if (breakdown) {
          if (MergeRequestStatus.OPENED in obj.statsBySortingObject) {
            obj.statsBySortingObject[assignee] = {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              OPEN: obj.statsBySortingObject[assignee].OPEN + 1,
            };
          } else {
            obj.statsBySortingObject[assignee] = { OPEN: totalMergeRequestsPerAuthor[assignee] };
          }
        } else {
          if (assignee in obj.statsBySortingObject) {
            obj.statsBySortingObject[assignee] = {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              OPENED: obj.statsBySortingObject[assignee].OPENED + 1,
              MERGED: obj.statsBySortingObject[assignee].MERGED,
              CLOSED: obj.statsBySortingObject[assignee].CLOSED,
            };
          } else {
            obj.statsBySortingObject[assignee] = { OPENED: 1, MERGED: 0, CLOSED: 0 };
          }
        }
      }
      if (
        Date.parse(<string>sortedMergeRequest[i].closedAt) >= currTimestamp &&
        Date.parse(<string>sortedMergeRequest[i].closedAt) < nextTimestamp
      ) {
        if (!(assignee in totalMergeRequestsPerAuthor)) {
          totalMergeRequestsPerAuthor[assignee] = 0;
        }
        totalMergeRequestsPerAuthor[assignee] -= 1;

        if (breakdown) {
          if (MergeRequestStatus.OPENED in obj.statsBySortingObject) {
            obj.statsBySortingObject[assignee] = {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              OPEN: obj.statsBySortingObject[assignee].OPEN - 1,
            };
          } else {
            obj.statsBySortingObject[assignee] = { OPEN: totalMergeRequestsPerAuthor[assignee] };
          }
        } else {
          if (sortedMergeRequest[i].state === 'MERGED') {
            if (assignee in obj.statsBySortingObject) {
              obj.statsBySortingObject[assignee] = {
                OPENED: obj.statsBySortingObject[assignee].OPENED,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                MERGED: obj.statsBySortingObject[assignee].MERGED - 1,
                CLOSED: obj.statsBySortingObject[assignee].CLOSED,
              };
            } else {
              obj.statsBySortingObject[assignee] = { OPENED: 0, MERGED: -1, CLOSED: 0 };
            }
          }
          if (sortedMergeRequest[i].state === 'CLOSED') {
            if (assignee in obj.statsBySortingObject) {
              obj.statsBySortingObject[assignee] = {
                OPENED: obj.statsBySortingObject[assignee].OPENED,
                MERGED: obj.statsBySortingObject[assignee].MERGED,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                CLOSED: obj.statsBySortingObject[assignee].CLOSED - 1,
              };
            } else {
              obj.statsBySortingObject[assignee] = { OPENED: 0, MERGED: 0, CLOSED: -1 };
            }
          }
        }
      }
      if (breakdown) {
        if (!(assignee in obj.statsBySortingObject)) {
          obj.statsBySortingObject[assignee] = { OPEN: totalMergeRequestsPerAuthor[assignee] };
        }
      } else {
        if (!(assignee in obj.statsBySortingObject)) {
          obj.statsBySortingObject[assignee] = { OPENED: 0, MERGED: 0, CLOSED: 0 };
        }
      }
    }
    data.push(obj);
  }
  console.log('data', data);
  //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED COMMITS ----
  if (breakdown) {
    palette['Open Merge Requests ' + UNASSIGNED] = { main: '#555555', secondary: '#777777' };
    palette['Open Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = { main: '#444444', secondary: '#666666' };
  } else {
    palette['Opened Merge Requests ' + UNASSIGNED] = { main: '#666666', secondary: '#888888' };
    palette['Merged Merge Requests ' + UNASSIGNED] = { main: '#444444', secondary: '#666666' };
    palette['Closed Merge Requests ' + UNASSIGNED] = { main: '#222222', secondary: '#444444' };
    palette['Opened Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = { main: '#555555', secondary: '#777777' };
    palette['Merged Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = { main: '#333333', secondary: '#555555' };
    palette['Closed Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = { main: '#111111', secondary: '#333333' };
  }
  data.forEach((mergeRequest) => {
    //commit has structure {date, statsByAuthor: {}} (see next line)}
    const obj: MergeRequestChartData = { date: mergeRequest.date };

    if (breakdown) {
      for (const author of authors) {
        palette['Open Merge Requests ' + (author.displayName || author.user.gitSignature)] = {
          main: chroma(author.color.main).hex(),
          secondary: chroma(author.color.secondary).hex(),
        };
        obj['Open Merge Requests ' + (author.displayName || author.user.gitSignature)] = 0;
      }
      obj['Open Merge Requests ' + UNASSIGNED] = 0;
      obj['Open Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = 0;
    } else {
      for (const author of authors) {
        palette['Opened Merge Requests ' + (author.displayName || author.user.gitSignature)] = {
          main: chroma(author.color.main).hex(),
          secondary: chroma(author.color.secondary).hex(),
        };
        palette['Merged Merge Requests ' + (author.displayName || author.user.gitSignature)] = {
          main: chroma(author.color.main).darken(0.3).hex(),
          secondary: chroma(author.color.secondary).darken(0.3).hex(),
        };
        palette['Closed Merge Requests ' + (author.displayName || author.user.gitSignature)] = {
          main: chroma(author.color.main).darken(0.5).hex(),
          secondary: chroma(author.color.secondary).darken(0.5).hex(),
        };
        obj['Opened Merge Requests ' + (author.displayName || author.user.gitSignature)] = 0;
        obj['Merged Merge Requests ' + (author.displayName || author.user.gitSignature)] = 0;
        obj['Closed Merge Requests ' + (author.displayName || author.user.gitSignature)] = 0;
      }
      obj['Opened Merge Requests ' + UNASSIGNED] = 0;
      obj['Merged Merge Requests ' + UNASSIGNED] = 0;
      obj['Closed Merge Requests ' + UNASSIGNED] = 0;
      obj['Opened Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = 0;
      obj['Merged Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = 0;
      obj['Closed Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = 0;
    }

    authors.forEach((author) => {
      if (!author.selected) return;
      const name =
        author.parent === -1
          ? author.displayName || author.user.gitSignature
          : author.parent === 0
            ? 'others'
            : authors.filter((a) => a.id === author.parent)[0].user.gitSignature;

      if (author.user.id in mergeRequest.statsBySortingObject) {
        //Insert number of changes with the author name as key,
        //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
        if (breakdown) {
          if ('Open Merge Requests ' + name in obj) {
            obj['Open Merge Requests ' + name] += mergeRequest.statsBySortingObject[author.user.id]?.OPEN || 0;
          } else {
            obj['Open Merge Requests ' + name] = mergeRequest.statsBySortingObject[author.user.id]?.OPEN || 0;
          }
        } else {
          if ('Opened Merge Requests ' + name in obj && 'Failed Merge Requests ' + name in obj) {
            obj['Opened Merge Requests ' + name] += mergeRequest.statsBySortingObject[author.user.id]?.OPENED || 0;
            obj['Merged Merge Requests ' + name] += mergeRequest.statsBySortingObject[author.user.id]?.MERGED || 0;
            obj['Closed Merge Requests ' + name] += mergeRequest.statsBySortingObject[author.user.id]?.CLOSED || 0;
          } else {
            obj['Opened Merge Requests ' + name] = mergeRequest.statsBySortingObject[author.user.id]?.OPENED || 0;
            obj['Merged Merge Requests ' + name] = mergeRequest.statsBySortingObject[author.user.id]?.MERGED || 0;
            obj['Closed Merge Requests ' + name] = mergeRequest.statsBySortingObject[author.user.id]?.CLOSED || 0;
          }
        }
      }
    });
    if (UNASSIGNED in mergeRequest.statsBySortingObject) {
      if (breakdown) {
        if ('Open Merge Requests ' + UNASSIGNED in obj) {
          obj['Open Merge Requests ' + UNASSIGNED] += mergeRequest.statsBySortingObject[UNASSIGNED]?.OPEN || 0;
        } else {
          obj['Opened Merge Requests ' + UNASSIGNED] = mergeRequest.statsBySortingObject[UNASSIGNED]?.OPENED || 0;
          //-0.001 for stack layout to realize it belongs on the bottom
          obj['Merged Merge Requests ' + UNASSIGNED] = mergeRequest.statsBySortingObject[UNASSIGNED]?.MERGED || 0;
          obj['Closed Merge Requests ' + UNASSIGNED] = mergeRequest.statsBySortingObject[UNASSIGNED]?.CLOSED || 0;
        }
        if ('Open Merge Requests ' + ACCOUNT_NOT_ASSIGNED in obj) {
          obj['Open Merge Requests ' + ACCOUNT_NOT_ASSIGNED] += mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.OPEN || 0;
        } else {
          obj['Opened Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.OPENED || 0;
          //-0.001 for stack layout to realize it belongs on the bottom
          obj['Merged Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.MERGED || 0;
          obj['Closed Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.CLOSED || 0;
        }
      } else {
        if ('Opened Merge Requests ' + UNASSIGNED in obj && 'Failed Merge Requests ' + UNASSIGNED in obj) {
          obj['Opened Merge Requests ' + UNASSIGNED] += mergeRequest.statsBySortingObject[UNASSIGNED]?.OPENED || 0;
          //-0.001 for stack layout to realize it belongs on the bottom
          obj['Merged Merge Requests ' + UNASSIGNED] += mergeRequest.statsBySortingObject[UNASSIGNED]?.MERGED || 0;
          obj['Closed Merge Requests ' + UNASSIGNED] += mergeRequest.statsBySortingObject[UNASSIGNED]?.CLOSED || 0;
        } else {
          obj['Opened Merge Requests ' + UNASSIGNED] = mergeRequest.statsBySortingObject[UNASSIGNED]?.OPENED || 0;
          //-0.001 for stack layout to realize it belongs on the bottom
          obj['Merged Merge Requests ' + UNASSIGNED] = mergeRequest.statsBySortingObject[UNASSIGNED]?.MERGED || 0;
          obj['Closed Merge Requests ' + UNASSIGNED] = mergeRequest.statsBySortingObject[UNASSIGNED]?.CLOSED || 0;
        }
        if ('Opened Merge Requests ' + ACCOUNT_NOT_ASSIGNED in obj && 'Failed Merge Requests ' + ACCOUNT_NOT_ASSIGNED in obj) {
          obj['Opened Merge Requests ' + ACCOUNT_NOT_ASSIGNED] += mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.OPENED || 0;
          //-0.001 for stack layout to realize it belongs on the bottom
          obj['Merged Merge Requests ' + ACCOUNT_NOT_ASSIGNED] += mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.MERGED || 0;
          obj['Closed Merge Requests ' + ACCOUNT_NOT_ASSIGNED] += mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.CLOSED || 0;
        } else {
          obj['Opened Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.OPENED || 0;
          //-0.001 for stack layout to realize it belongs on the bottom
          obj['Merged Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.MERGED || 0;
          obj['Closed Merge Requests ' + ACCOUNT_NOT_ASSIGNED] = mergeRequest.statsBySortingObject[ACCOUNT_NOT_ASSIGNED]?.CLOSED || 0;
        }
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
        if (key.includes('Opened Merge Requests ')) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('Closed Merge Requests ')) {
          negativeTotals += dataPoint[key];
        } else if (key.includes('Merged Merge Requests ')) {
          negativeTotals += dataPoint[key];
        } else if (key.includes('Open Merge Requests ')) {
          if (dataPoint[key] > 0) {
            positiveTotals += dataPoint[key];
          } else {
            negativeTotals += dataPoint[key];
          }
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
