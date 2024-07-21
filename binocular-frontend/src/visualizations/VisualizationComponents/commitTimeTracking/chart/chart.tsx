import { Author, Committer } from '../../../../types/authorTypes.ts';
import { Commit } from '../../../../types/commitTypes.ts';
import getCommitType from '../../../../utils/getCommitType.ts';
import * as React from 'react';
import _ from 'lodash';
import CommitBarChart from './CommitBarChart.tsx';
import styles from '../styles.module.scss';

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

  React.useEffect(() => {
    const fetchData = async () => {
      setCommitChartData(await extractCommitData(props));
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
              Math.round((d.lineChanges / Math.max(1, d.timeSpent[props.useActualTime ? 'actual' : 'estimated'])) * 100) / 100.0
            } lines/minute<br>
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
      .style('display', 'block')
      .style('max-width', '400px')
      .style('min-width', '250px');

    const tooltipWidth = +tooltip.style('width').substring(0, tooltip.style('width').length - 2);
    const tooltipHeight = +tooltip.style('height').substring(0, tooltip.style('height').length - 2);
    tooltip.style('left', `${event.x - tooltipWidth / 2 - 511}px`).style('top', `calc(50% - ${35 + tooltipHeight}px)`);
  };

  const commitChart =
    commitChartData !== undefined && commitChartData.length > 0 ? (
      <CommitBarChart
        key={
          commitChartData.map((d) => d.commitSHA).join('-') +
          (props.useActualTime ? '' : commitChartData.map((d) => d.timeSpent.estimated).join('-')) +
          commitChartData
            .map((d) =>
              props.useRatio ? d.lineChanges / Math.max(d.timeSpent[props.useActualTime ? 'actual' : 'estimated'], 1) : d.lineChanges,
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
                ? d.lineChanges / Math.max(d.timeSpent[props.useActualTime ? 'actual' : 'estimated'], 1)
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

const extractCommitData = async (props: Props): Promise<CommitChartData[]> => {
  if (!props.commits || props.commits.length === 0) {
    return [];
  }

  const filteredCommits = props.filteredCommits.filter((value, index, array) => array.findIndex((el) => el.date === value.date) === index);
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
  return filterCommits(commitsWithDate, props).map((c) => {
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
    while (curCommit !== null) {
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
      const time = timeStamp.split(' ')[1];
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
  console.log(commits);
  console.log(props);
  const filteredCommits = commits.filter((c) => {
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

    return true;
  });
  return filteredCommits;
}
