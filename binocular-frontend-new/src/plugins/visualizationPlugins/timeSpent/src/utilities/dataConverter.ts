import moment from 'moment/moment';
import chroma from 'chroma-js';
import _ from 'lodash';
import { SettingsType } from '../settings/settings.tsx';
import { Properties } from '../../../../interfaces/visualizationPluginInterfaces/properties.ts';
import { DataPluginNote } from '../../../../interfaces/dataPluginInterfaces/dataPluginNotes.ts';
import { DataPluginMergeRequest } from '../../../../interfaces/dataPluginInterfaces/dataPluginMergeRequests.ts';
import { DataPluginAccount } from '../../../../interfaces/dataPluginInterfaces/dataPluginAccounts.ts';
import { DataPluginIssue } from '../../../../interfaces/dataPluginInterfaces/dataPluginIssues.ts';
import distinctColors from 'distinct-colors';

interface TimeSpentChartData {
  date: number;
  [signature: string]: number;
}

interface TimeTrackingData {
  author: DataPluginAccount;
  timeSpent: number;
  createdAt: string;
  issue: DataPluginIssue | null;
  mergeRequest: DataPluginMergeRequest | null;
}

interface IssueAndMR {
  id: string;
  title: string;
  color: { main: string; secondary: string };
}

interface Palette {
  [signature: string]: { main: string; secondary: string };
}

export function convertToChartData(
  notes: DataPluginNote[],
  props: Properties<SettingsType, DataPluginNote>,
): {
  chartData: TimeSpentChartData[];
  scale: number[];
  palette: Palette;
} {
  if (!notes || notes.length === 0) {
    return { chartData: [], palette: {}, scale: [] };
  }
  const timeTrackingData = extractTimeTrackingDataFromNotes(notes);
  const sortedData = _.clone(timeTrackingData).sort((d1, d2) => new Date(d1.createdAt).getTime() - new Date(d2.createdAt).getTime());
  const firstTimestamp = sortedData[0].createdAt;
  const lastTimestamp = sortedData[sortedData.length - 1].createdAt;

  const chartData: TimeSpentChartData[] = [];
  const scale: number[] = [0, 0];
  const palette: Palette = {};

  let returnValue;

  if (sortedData.length > 0) {
    if (props.settings.splitTimePerIssue) {
      returnValue = getDataByIssue(props, firstTimestamp, lastTimestamp, sortedData, scale, palette, chartData);
    } else {
      returnValue = getDataByAuthor(props, firstTimestamp, lastTimestamp, sortedData, scale, palette, chartData);
    }
  } else {
    return { chartData: [], palette: {}, scale: [] };
  }
  return returnValue;
}
function getDataByIssue(
  props: Properties<SettingsType, DataPluginNote>,
  firstTimestamp: string,
  lastTimestamp: string,
  sortedData: TimeTrackingData[],
  scale: number[],
  palette: Palette,
  chartData: TimeSpentChartData[],
) {
  const data: Array<{ date: number; statsBySortingObject: { [signature: string]: { spent: number; removed: number } } }> = [];
  //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
  const granularity = getGranularity(props.parameters.parametersGeneral.granularity);
  const curr = moment(firstTimestamp)
    .startOf(granularity.unit as moment.unitOfTime.StartOf)
    .subtract(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
  const end = moment(lastTimestamp)
    .endOf(granularity.unit as moment.unitOfTime.StartOf)
    .add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
  const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
  let issuesAndMRs: IssueAndMR[] = [];
  for (
    let i = 0;
    curr.isSameOrBefore(end);
    curr.add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity),
      next.add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity)
  ) {
    //Iterate through time buckets
    const currTimestamp = curr.toDate().getTime();
    const nextTimestamp = next.toDate().getTime();
    const obj: { date: number; statsBySortingObject: { [signature: string]: { spent: number; removed: number } } } = {
      date: currTimestamp,
      statsBySortingObject: {},
    }; //Save date of time bucket, create object
    for (; i < sortedData.length && Date.parse(sortedData[i].createdAt) < nextTimestamp; i++) {
      //Iterate through commits that fall into this time bucket
      let spent = 0;
      let removed = 0;
      let issueOrMR: IssueAndMR;
      if (sortedData[i].issue) {
        issueOrMR = {
          id: sortedData[i].issue?.id + '',
          title: '#' + sortedData[i].issue?.iid + ': ' + sortedData[i].issue?.title,
          color: { main: '', secondary: '' },
        };
        !issuesAndMRs.some((item) => item.id === issueOrMR.id) && issuesAndMRs.push(issueOrMR);
      } else if (sortedData[i].mergeRequest !== null) {
        issueOrMR = {
          id: sortedData[i].mergeRequest?.id + '',
          title: '!' + sortedData[i].mergeRequest?.iid + ': ' + sortedData[i].mergeRequest?.title,
          color: { main: '', secondary: '' },
        };
        !issuesAndMRs.some((item) => item.id === issueOrMR.id) && issuesAndMRs.push(issueOrMR);
      } else {
        issueOrMR = { id: '-1', title: '', color: { main: '', secondary: '' } };
      }
      if (sortedData[i].timeSpent > 0) {
        spent = sortedData[i].timeSpent;
      } else if (sortedData[i].timeSpent < 0) {
        removed = sortedData[i].timeSpent;
      }
      if (issueOrMR && issueOrMR.id in obj.statsBySortingObject) {
        obj.statsBySortingObject[issueOrMR.id] = {
          spent: obj.statsBySortingObject[issueOrMR.id].spent + spent,
          removed: obj.statsBySortingObject[issueOrMR.id].removed + removed,
        };
      } else {
        //Else create new values
        obj.statsBySortingObject[issueOrMR.id] = { spent: spent, removed: removed };
      }
    }
    data.push(obj);
  }

  const colors = distinctColors({ count: issuesAndMRs.length, lightMin: 50 });
  issuesAndMRs = issuesAndMRs.map((item, index) => ({
    ...item,
    color: { main: colors[index].hex(), secondary: colors[index].hex() + '55' },
  }));

  //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED NOTES ----
  data.forEach((object) => {
    //commit has structure {date, statsByAuthor: {}} (see next line)}
    const obj: TimeSpentChartData = { date: object.date };
    if (props.settings.splitSpentRemoved) {
      for (const issueOrMR of issuesAndMRs) {
        palette['(Spent) ' + issueOrMR.title] = {
          main: chroma(issueOrMR.color.main).hex(),
          secondary: chroma(issueOrMR.color.secondary).hex(),
        };
        palette['(Removed) ' + issueOrMR.title] = {
          main: chroma(issueOrMR.color.main).darken(0.5).hex(),
          secondary: chroma(issueOrMR.color.secondary).darken(0.5).hex(),
        };
        obj['(Spent) ' + issueOrMR.title] = 0.001;
        obj['(Removed) ' + issueOrMR.title] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
      }
    } else {
      for (const issueOrMR of issuesAndMRs) {
        palette[issueOrMR.title] = {
          main: chroma(issueOrMR.color.main).hex(),
          secondary: chroma(issueOrMR.color.secondary).hex(),
        };
        obj[issueOrMR.title] = 0;
      }
      obj['others'] = 0;
    }

    issuesAndMRs.forEach((issueOrMR) => {
      const name = issueOrMR.title;
      if (props.settings.splitSpentRemoved) {
        if (issueOrMR.id in object.statsBySortingObject) {
          //Insert number of changes with the issueOrMR name as key,
          //statsBySortingObject has structure {{sortingObject: {spent, removed}}, ...}
          if ('(Spent) ' + name in obj && '(Removed) ' + name in obj) {
            obj['(Spent) ' + name] += object.statsBySortingObject[issueOrMR.id].spent;
            //-0.001 for stack layout to realize it belongs on the bottom
            obj['(Removed) ' + name] += object.statsBySortingObject[issueOrMR.id].removed - 0.001;
          } else {
            obj['(Removed) ' + name] = object.statsBySortingObject[issueOrMR.id].spent;
            //-0.001 for stack layout to realize it belongs on the bottom
            obj['(Removed) ' + name] = object.statsBySortingObject[issueOrMR.id].removed - 0.001;
          }
        }
      } else {
        if (issueOrMR.id in object.statsBySortingObject) {
          if (name in obj) {
            obj[name] += object.statsBySortingObject[issueOrMR.id].spent + object.statsBySortingObject[issueOrMR.id].removed;
          } else {
            obj[name] = object.statsBySortingObject[issueOrMR.id].spent + object.statsBySortingObject[issueOrMR.id].removed;
          }
        }
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
        if (key.includes('(Spent)')) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('(Removed)')) {
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

function getDataByAuthor(
  props: Properties<SettingsType, DataPluginNote>,
  firstTimestamp: string,
  lastTimestamp: string,
  sortedData: TimeTrackingData[],
  scale: number[],
  palette: Palette,
  chartData: TimeSpentChartData[],
) {
  const data: Array<{ date: number; statsBySortingObject: { [signature: string]: { spent: number; removed: number } } }> = [];
  //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
  const granularity = getGranularity(props.parameters.parametersGeneral.granularity);
  const curr = moment(firstTimestamp)
    .startOf(granularity.unit as moment.unitOfTime.StartOf)
    .subtract(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
  const end = moment(lastTimestamp)
    .endOf(granularity.unit as moment.unitOfTime.StartOf)
    .add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
  const next = moment(curr).add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity);
  const totalNotesPerAuthor: { [signature: string]: number } = {};
  for (
    let i = 0;
    curr.isSameOrBefore(end);
    curr.add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity),
      next.add(1, <moment.unitOfTime.DurationConstructor>props.parameters.parametersGeneral.granularity)
  ) {
    //Iterate through time buckets
    const currTimestamp = curr.toDate().getTime();
    const nextTimestamp = next.toDate().getTime();
    const obj: { date: number; statsBySortingObject: { [signature: string]: { spent: number; removed: number } } } = {
      date: currTimestamp,
      statsBySortingObject: {},
    }; //Save date of time bucket, create object
    for (; i < sortedData.length && Date.parse(sortedData[i].createdAt) < nextTimestamp; i++) {
      //Iterate through commits that fall into this time bucket
      let spent = 0;
      let removed = 0;

      if (sortedData[i].author.user !== null) {
        const author = sortedData[i].author.user!.id;
        if (sortedData[i].timeSpent > 0) {
          spent = sortedData[i].timeSpent;
        } else if (sortedData[i].timeSpent < 0) {
          removed = sortedData[i].timeSpent;
        }
        if (totalNotesPerAuthor[author] === undefined) {
          totalNotesPerAuthor[author] = 0;
        }
        totalNotesPerAuthor[author] += 1;

        if (author in obj.statsBySortingObject) {
          obj.statsBySortingObject[author] = {
            spent: obj.statsBySortingObject[author].spent + spent,
            removed: obj.statsBySortingObject[author].removed + removed,
          };
        } else {
          //Else create new values
          obj.statsBySortingObject[author] = { spent: spent, removed: removed };
        }
      }
    }
    data.push(obj);
  }

  //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED NOTES ----
  data.forEach((object) => {
    //commit has structure {date, statsByAuthor: {}} (see next line)}
    const obj: TimeSpentChartData = { date: object.date };
    if (props.settings.splitSpentRemoved) {
      for (const author of props.authorList) {
        palette['(Spent) ' + (author.displayName || author.user.gitSignature)] = {
          main: chroma(author.color.main).hex(),
          secondary: chroma(author.color.secondary).hex(),
        };
        palette['(Removed) ' + (author.displayName || author.user.gitSignature)] = {
          main: chroma(author.color.main).darken(0.5).hex(),
          secondary: chroma(author.color.secondary).darken(0.5).hex(),
        };
        obj['(Spent) ' + (author.displayName || author.user.gitSignature)] = 0.001;
        obj['(Removed) ' + (author.displayName || author.user.gitSignature)] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
      }
    } else {
      for (const author of props.authorList) {
        palette[author.displayName || author.user.gitSignature] = {
          main: chroma(author.color.main).hex(),
          secondary: chroma(author.color.secondary).hex(),
        };
        obj[author.displayName || author.user.gitSignature] = 0;
      }
      obj['others'] = 0;
    }

    props.authorList.forEach((author) => {
      if (!author.selected) return;
      const name =
        author.parent === -1
          ? author.displayName || author.user.gitSignature
          : author.parent === 0
            ? 'others'
            : props.authorList.filter((a) => a.id === author.parent)[0].user.gitSignature;
      if (props.settings.splitSpentRemoved) {
        if (author.user.id in object.statsBySortingObject) {
          //Insert number of changes with the author name as key,
          //statsBySortingObject has structure {{authorName: {spent, removed}}, ...}
          if ('(Spent) ' + name in obj && '(Removed) ' + name in obj) {
            obj['(Spent) ' + name] += object.statsBySortingObject[author.user.id].spent;
            //-0.001 for stack layout to realize it belongs on the bottom
            obj['(Removed) ' + name] += object.statsBySortingObject[author.user.id].removed - 0.001;
          } else {
            obj['(Removed) ' + name] = object.statsBySortingObject[author.user.id].spent;
            //-0.001 for stack layout to realize it belongs on the bottom
            obj['(Removed) ' + name] = object.statsBySortingObject[author.user.id].removed - 0.001;
          }
        }
      } else {
        if (author.user.id in object.statsBySortingObject) {
          if (name in obj) {
            obj[name] += object.statsBySortingObject[author.user.id].spent + object.statsBySortingObject[author.user.id].removed;
          } else {
            obj[name] = object.statsBySortingObject[author.user.id].spent + object.statsBySortingObject[author.user.id].removed;
          }
        }
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
        if (key.includes('(Spent)')) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('(Removed)')) {
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

export function extractTimeTrackingDataFromNotes(notes: DataPluginNote[]) {
  let timeTrackingData: TimeTrackingData[] = [];
  if (notes !== undefined && notes !== null) {
    [...notes].reverse().forEach((note) => {
      const timeAddedNote = /^added ([0-9a-z ]+) of time spent.*/.exec(note.body);
      const timeSubtractedNote = /^subtracted ([0-9a-z ]+) of time spent.*/.exec(note.body);
      const timeDeletedNote = /^deleted ([0-9a-z ]+) of spent time.*/.exec(note.body);
      const timeSubtractedDeletedNote = /^deleted -([0-9a-z ]+) of spent time.*/.exec(note.body);
      const removedTimeSpentNote = /^removed time spent.*/.exec(note.body);

      if (timeAddedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: convertTime(timeAddedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (timeSubtractedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: -convertTime(timeSubtractedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (timeDeletedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: -convertTime(timeDeletedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (timeSubtractedDeletedNote) {
        timeTrackingData.push({
          author: note.author,
          timeSpent: convertTime(timeSubtractedDeletedNote[1]) / 3600,
          createdAt: note.createdAt,
          issue: note.issue,
          mergeRequest: note.mergeRequest,
        });
      } else if (removedTimeSpentNote) {
        if (note.issue) {
          timeTrackingData = timeTrackingData.filter((item) => item.issue?.id !== note.issue?.id);
        } else if (note.mergeRequest) {
          timeTrackingData = timeTrackingData.filter((item) => item.mergeRequest?.id !== note.mergeRequest?.id);
        }
      }
    });
  }
  return timeTrackingData;
}

function convertTime(timeString: string) {
  const timeParts = timeString.split(' ');
  let time = 0;
  timeParts.forEach((part) => {
    if (part.endsWith('h')) {
      time += parseInt(part.substring(0, part.length - 1)) * 60 * 60;
    }
    if (part.endsWith('m')) {
      time += parseInt(part.substring(0, part.length - 1)) * 60;
    }
    if (part.endsWith('2')) {
      time += parseInt(part.substring(0, part.length - 1));
    }
  });
  return time;
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
