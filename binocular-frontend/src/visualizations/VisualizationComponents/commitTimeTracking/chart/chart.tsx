import { Author, Committer } from '../../../../types/authorTypes.ts';
import { Commit } from '../../../../types/commitTypes.ts';
import getCommitType from '../../../../utils/getCommitType.ts';
import * as React from 'react';
import _ from 'lodash';
import CommitBarChart from './CommitBarChart.tsx';
import styles from '../styles.module.scss';
import * as d3 from 'd3';
import { DateRange } from '../../../../types/globalTypes.ts';

interface Props {
  commits: Commit[];
  selectedBranch: string;
  branches: string[];
  commitType: string[];
  threshold: {
    hours: { lower: number; upper: number };
    change: { lower: number; upper: number };
    ratio: { lower: number; upper: number };
  };
  filteredCommits: Commit[];
  excludeMergeCommits: boolean;
  excludedCommits: string[];
  excludeCommits: boolean;
  mergedAuthors: Author[];
  otherAuthors: Committer[];
  selectedAuthors: string[];
  universalSettings: boolean;
  searchTerm: string;
  firstCommitTime: number;
  maxSessionLength: number;
  useActualTime: boolean;
  useRatio: boolean;
  chartTimeSpan: DateRange;
}
interface CommitChartData {
  timeSpent: {
    estimated: number;
    actual: number;
  };
  commitLink: string;
  lineChanges: number;
  commitMessage: string;
  author: string;
  date: Date;
  commitType: { label: string; value: number }[];
  commitSHA: string;
}

export default (props: Props) => {
  const [commitChartData, setCommitChartData] = React.useState<CommitChartData[]>([]);
  const [statistics, setStatistics] = React.useState({});

  console.log(props.chartTimeSpan);
  React.useEffect(() => {
    const fetchData = async () => {
      const extractedData = await extractCommitData(props);
      setCommitChartData(extractedData.commitChartData);
      setStatistics(extractedData.statistics);
    };

    fetchData();
  }, [props]);

  const displayTooltip = (event, d, tooltip) => {
    tooltip
      .html(
        `
            Author: ${d.author}<br>
            Date: ${d.date.toLocaleDateString()}<br>
            Lines changed: ${d.lineChanges} lines<br>
            Time spent: ${d.timeSpent[props.useActualTime ? 'actual' : 'estimated']} minutes<br>
            Ratio: ${
              Math.round((d.timeSpent[props.useActualTime ? 'actual' : 'estimated'] / Math.max(d.lineChanges, 1)) * 100) / 100.0
            } Minutes/line change<br>
            Commit type: ${d.commitType[0].label}<br>
            Branch: ${d.branch}<br>
            <br>
            Commit message:<br>
            ${d.commitMessage}<br>
            <br>
            <a href="${d.commitLink}" target=”_blank”><i class="fa fa-link" ></i></a>Link to commit
            <div style="display: inline; float: right"> Copy sha <i class="fa fa-copy" onclick="navigator.clipboard.writeText('${
              d.commitSHA
            }')"></i></div>`,
      )
      .style('display', 'block');

    const tooltipWidth = +tooltip.style('width').substring(0, tooltip.style('width').length - 2);
    const tooltipHeight = +tooltip.style('height').substring(0, tooltip.style('height').length - 2);
    const tooltipXPosition =
      event.x + tooltipWidth / 2 < (visualViewport?.width ?? 1920)
        ? event.layerX - tooltipWidth / 2 > 0
          ? event.layerX - tooltipWidth / 2
          : 0
        : (visualViewport?.width ?? 1920) - tooltipWidth;
    tooltip.style('left', `${tooltipXPosition}px`).style('top', `calc(50% - ${35 + tooltipHeight}px)`);
  };

  const displayStatistics = (statisticsWindow, statisticsSettings, setState, colorDomain, colorPalette) => {
    const selectDiv = statisticsWindow.append('div').attr('class', styles.selectWrapper);

    const branchSelect = selectDiv
      .append('div')
      .attr('class', 'select ' + styles.select)
      .append('select')
      .attr('value', statisticsSettings.branch)
      .on('change', function () {
        const settingsCopy = { ...statisticsSettings };
        settingsCopy.branch = this.value;
        setState({ statisticsSettings: settingsCopy });
      });

    branchSelect
      .selectAll('option')
      .data(['All branches', ...props.branches])
      .enter()
      .append('option')
      .attr('value', (a) => a)
      .text((a) => (a.length <= 22 ? a : a.substring(0, 20) + '...'))
      .each(function (a) {
        if (branchSelect.attr('value') === a) {
          d3.select(this).attr('selected', true);
        }
      });

    const authors = props.mergedAuthors.map((author) => author.mainCommitter.substring(0, author.mainCommitter.indexOf('<') - 1));

    const authorSelect = selectDiv
      .append('div')
      .attr('class', 'select ' + styles.select)
      .append('select')
      .attr('value', statisticsSettings.author)
      .on('change', function () {
        const settingsCopy = { ...statisticsSettings };
        settingsCopy.author = this.value;
        setState({ statisticsSettings: settingsCopy });
      });

    authorSelect
      .selectAll('option')
      .data(['All authors', ...authors])
      .enter()
      .append('option')
      .attr('value', (a) => a)
      .text((a) => (a.length <= 22 ? a : a.substring(0, 20) + '...'))
      .each(function (a) {
        if (authorSelect.attr('value') === a) {
          d3.select(this).attr('selected', true);
        }
      });

    const metricSelect = selectDiv
      .append('div')
      .attr('class', 'select ' + styles.select)
      .append('select')
      .attr('value', statisticsSettings.metric)
      .on('change', function () {
        const settingsCopy = { ...statisticsSettings };
        settingsCopy.metric = this.value;
        setState({ statisticsSettings: settingsCopy });
      });

    const metricOptions = [
      { value: 'number', text: 'Number of commits' },
      { value: 'lines', text: 'Number of line changes' },
      { value: 'timeEstimated', text: 'Time spent (estimated)' },
      { value: 'timeActual', text: 'Time spent (actual)' },
    ];

    metricSelect
      .selectAll('option')
      .data(metricOptions)
      .enter()
      .append('option')
      .attr('value', (a) => a.value)
      .text((a) => a.text)
      .each(function (a) {
        if (metricSelect.attr('value') === a.value) {
          d3.select(this).attr('selected', true);
        }
      });

    const statisticsSubset = statistics[statisticsSettings.branch][statisticsSettings.author][statisticsSettings.metric];
    const categories = [];
    const total = Object.values<number>(statisticsSubset).reduce((prev: number, cur: number) => prev + cur);
    for (const key of Object.keys(statisticsSubset)) {
      // @ts-ignore
      categories.push({ name: key, value: statisticsSubset[key], ratio: (statisticsSubset[key] / total) * 100 });
    }

    if (total === 0) {
      statisticsWindow.append('div').attr('class', styles.noDataDiv).text('No data for this selection');
      return;
    }

    const statisticsDiv = statisticsWindow.append('div').attr('class', styles.statisticsDiv);

    let displayText = '';
    switch (statisticsSettings.metric) {
      case 'number':
        displayText = `Number of commits: ${total}`;
        break;
      case 'lines':
        displayText = `Number of line changes: ${total} lines`;
        break;
      case 'timeActual':
        displayText = `Time spent (actual): ${total} minutes`;
        break;
      default:
        displayText = `Time spent (estimated): ${total} minutes`;
    }

    statisticsDiv.text(displayText);

    const svg = statisticsDiv.append('svg').attr('class', styles.statisticsSvg).append('g').attr('transform', 'translate(90,90)');
    const pie = d3.pie().value((d) => d.value);
    const pieData = pie(categories);

    const color = d3.scaleOrdinal().domain(colorDomain).range(colorPalette);

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(90);

    svg
      .selectAll('pieSections')
      .data(pieData)
      .enter()
      .append('path')
      // @ts-ignore
      .attr('d', arcGenerator)
      .attr('fill', (d) => color(d.data.name) as string)
      .attr('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', 0.7)
      .on('mouseover', function () {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 0.7);
      });

    svg
      .selectAll('pieSections')
      .data(pieData)
      .enter()
      .append('text')
      .text((d) => (d.data.ratio === 0 ? '' : Math.round(d.data.ratio * 100) / 100 + '%'))
      .attr('transform', (d) => {
        // @ts-ignore
        const c = arcGenerator.centroid(d);
        const x = c[0];
        const y = c[1];
        const h = Math.sqrt(x * x + y * y);
        return `translate(${(x / h) * 60}, ${(y / h) * 60})`;
      })
      .style('text-anchor', 'middle')
      .style('font-size', 14);
  };

  const commitChart =
    commitChartData !== undefined && commitChartData.length > 0 ? (
      <CommitBarChart
        displayStatistics={displayStatistics}
        axisTitles={['Time (in minutes)', props.useRatio ? 'Minutes/line' : 'Number of line change']}
        key={
          commitChartData.map((d) => d.commitSHA).join('-') +
          (props.useActualTime ? '' : commitChartData.map((d) => d.timeSpent.estimated).join('-')) +
          commitChartData
            .map((d) =>
              props.useRatio ? d.timeSpent[props.useActualTime ? 'actual' : 'estimated'] / Math.max(d.lineChanges, 1) : d.lineChanges,
            )
            .join('-')
        }
        content={{
          commitData: commitChartData,
          upperChart: commitChartData.map((d) => {
            return {
              ticks: d.date.toString(),
              barHeight: d.timeSpent[props.useActualTime ? 'actual' : 'estimated'],
              color: d.commitType[0].label,
            };
          }),
          nodeChart: commitChartData.map((d) => {
            return {
              ticks: d.date.toString(),
              barHeight: 0,
              color: d.commitType[0].label,
            };
          }),
          lowerChart: commitChartData.map((d) => {
            return {
              ticks: d.date.toString(),
              barHeight: props.useRatio
                ? d.timeSpent[props.useActualTime ? 'actual' : 'estimated'] / Math.max(d.lineChanges, 1)
                : d.lineChanges,
              color: d.commitType[0].label,
            };
          }),
        }}
        colorDomain={['corrective', 'features', 'unknown', 'nonfunctional', 'perfective']}
        colorPalette={['#fd7f6f', '#7eb0d5', '#b2e061', '#bd7ebe', '#ffb55a']}
        defaultColor={'#000000'}
        dimensions={[visualViewport?.width ?? 1920, visualViewport?.height ?? 919]}
        displayTooltip={displayTooltip}
      />
    ) : (
      <div>No data during this time period!</div>
    );
  const loadingHint = (
    <div>
      <h1 className={styles.loadingHint}>
        Loading... <i className="fas fa-spinner fa-pulse" />
      </h1>
    </div>
  );
  return (
    <div>
      {commitChartData === null && loadingHint}
      {commitChartData && commitChart}
    </div>
  );
};

const extractCommitData = async (props: Props): Promise<{ commitChartData: CommitChartData[]; statistics: any }> => {
  if (!props.commits || props.commits.length === 0) {
    return { commitChartData: [], statistics: {} };
  }

  const filteredCommits = props.commits.filter((value, index, array) => array.findIndex((el) => el.date === value.date) === index);
  const commitsWithDate = filteredCommits.map((commit) => {
    return {
      ...commit,
      date: new Date(commit.date),
      commitType: [{ label: 'unknown', value: 1 }],
      timeSpent: { estimated: 0, actual: 0 },
    };
  });
  await addTypeToCommits(commitsWithDate);
  const sortedCommits = commitsWithDate.sort((a, b) => a.date.getTime() - b.date.getTime());
  addActualTime(sortedCommits);
  addEstimatedTime(sortedCommits, props);
  const statistics = calculateStatistics(sortedCommits, props);
  const commitChartData = filterCommits(commitsWithDate, props).map((c) => {
    return {
      commitType: c.commitType,
      timeSpent: c.timeSpent,
      commitLink: c.webUrl,
      lineChanges: c.stats.additions + c.stats.deletions,
      commitMessage: c.message,
      date: c.date,
      author: c.signature.substring(0, c.signature.indexOf('<') - 1),
      commitSHA: c.sha,
      branch: c.branch,
    };
  });
  return { commitChartData: commitChartData, statistics: statistics };
};

function addEstimatedTime(commits: any[], props: Props) {
  const firstCommitTime = props.firstCommitTime;
  const maxCommitDiff = props.maxSessionLength;
  const mergedAuthors = [...props.mergedAuthors].filter((author) => props.selectedAuthors.includes(author.mainCommitter));
  mergedAuthors.forEach((mergedAuthor) => {
    const filteredCommits = commits.filter((commit) => _.map(mergedAuthor.committers, 'signature').includes(commit.signature));
    if (filteredCommits.length === 0) {
      return;
    }
    filteredCommits[0].timeSpent.estimated = firstCommitTime;
    let prevCommit = filteredCommits.shift();
    let curCommit = filteredCommits.shift();
    // eslint-disable-next-line eqeqeq
    while (curCommit != null) {
      if ((curCommit.date.getTime() - prevCommit.date.getTime()) / 1000 / 60 > maxCommitDiff) {
        curCommit.timeSpent.estimated = firstCommitTime;
      } else {
        curCommit.timeSpent.estimated = Math.round((curCommit.date.getTime() - prevCommit.date.getTime()) / 1000 / 60);
      }
      prevCommit = curCommit;
      curCommit = filteredCommits.shift();
    }
  });
}

function addActualTime(commits: any[]) {
  return commits.forEach((c) => {
    let timeSpent = 0;
    const regex = 'Time-spent: [0-9]*h[0-9]*m';

    const timeStamp = c.message.match(regex);
    if (timeStamp) {
      const time = timeStamp[0].split(' ')[1];
      timeSpent = +time.substring(0, time.indexOf('h')) * 60 + +time.substring(time.indexOf('h') + 1, time.indexOf('m'));
    }
    c.timeSpent = { actual: timeSpent };
  });
}

async function addTypeToCommits(commits: any[]) {
  for (const c of commits) {
    const commitType = await getCommitType(c.message);
    if (!commitType || commitType.length === 0) {
      c.commitType = [{ label: 'unknown', value: 1 }];
    } else {
      c.commitType = commitType.map((type: { label: string; value: any }) => {
        return { label: type.label.substring(9), value: type.value };
      });
    }
  }
}

function filterCommits(commits: any[], props: Props) {
  return commits.filter((c) => {
    if (props.selectedBranch && c.branch !== props.selectedBranch) {
      return false;
    }
    const commitTime = props.useActualTime ? c.timeSpent.actual : c.timeSpent.estimated;
    if (commitTime < props.threshold.hours.lower || commitTime > props.threshold.hours.upper) {
      return false;
    }
    const lineChanges = c.stats.additions + c.stats.deletions;
    if (lineChanges < props.threshold.change.lower || lineChanges > props.threshold.change.upper) {
      return false;
    }
    if (
      lineChanges / (commitTime <= 0 ? 1 : commitTime) < props.threshold.ratio.lower ||
      lineChanges / (commitTime <= 0 ? 1 : commitTime) > props.threshold.ratio.upper
    ) {
      return false;
    }
    if (!props.commitType.includes(c.commitType[0].label)) {
      return false;
    }
    if (props.searchTerm && !c.message.toLowerCase().includes(props.searchTerm.toLowerCase())) {
      return false;
    }

    if (!props.selectedAuthors.includes(c.signature)) {
      return false;
    }

    if (props.excludeMergeCommits && c.message.includes('Merge')) {
      return false;
    }

    if (props.excludeCommits && props.excludedCommits.includes(c.sha)) {
      return false;
    }

    if (new Date(props.chartTimeSpan.from ?? 0).getTime() > c.date.getTime()) {
      return false;
    }

    if (new Date(props.chartTimeSpan.to ?? 0).getTime() < c.date.getTime()) {
      return false;
    }

    return true;
  });
}

function calculateStatistics(commits: any[], props: Props) {
  if (commits.length === 0) {
    return {};
  }

  const initialValue = {};
  ['corrective', 'features', 'unknown', 'nonfunctional', 'perfective'].forEach((c) => {
    initialValue[c] = 0;
  });
  const branches = [...props.branches, 'All branches'];
  const authors = [...props.mergedAuthors, 'All authors'];
  const statistics = {};

  branches.forEach((b) => {
    statistics[b] = {};
    if (b === 'All branches') {
      authors.forEach((a) => {
        if (typeof a === 'string' && a === 'All authors') {
          statistics[b][a] = calculateRatios(commits, initialValue);
        } else {
          const author = a as Author;
          const authorName = author.mainCommitter.substring(0, author.mainCommitter.indexOf('<') - 1);
          const filteredForAuthor = commits.filter((c) => author.committers.map((committer) => committer.signature).includes(c.signature));
          statistics[b][authorName] = calculateRatios(filteredForAuthor, initialValue);
        }
      });
    } else {
      const filteredForBranch = commits.filter((c) => c.branch === b);
      authors.forEach((a) => {
        if (a === 'All authors') {
          statistics[b][a] = calculateRatios(filteredForBranch, initialValue);
        } else {
          const author = a as Author;
          const authorName = author.mainCommitter.substring(0, author.mainCommitter.indexOf('<') - 1);
          const filteredForAuthor = filteredForBranch.filter((c) =>
            author.committers.map((committer) => committer.signature).includes(c.signature),
          );
          statistics[b][authorName] = calculateRatios(filteredForAuthor, initialValue);
        }
      });
    }
  });

  return statistics;
}

function calculateRatios(commits: any[], initialValue: any) {
  return {
    timeEstimated: reduceForMetric(commits, initialValue, 'timeEstimated'),
    timeActual: reduceForMetric(commits, initialValue, 'timeActual'),
    lines: reduceForMetric(commits, initialValue, 'lines'),
    number: reduceForMetric(commits, initialValue, 'number'),
  };
}

function reduceForMetric(commits: any[], initialValue: any, metric: string) {
  return commits.reduce(
    (prev, cur) => {
      const type = cur.commitType[0].label;
      switch (metric) {
        case 'number':
          prev[type] += 1;
          break;
        case 'lines':
          prev[type] += cur.stats.additions + cur.stats.deletions;
          break;
        case 'timeActual':
          prev[type] += cur.timeSpent.actual;
          break;
        case 'timeEstimated':
          prev[type] += cur.timeSpent.estimated;
          break;
        default:
          break;
      }
      return prev;
    },
    { ...initialValue },
  );
}
