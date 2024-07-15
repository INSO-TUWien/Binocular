import {Author, Committer} from '../../../../types/authorTypes.ts';
import {Commit} from "../../../../types/commitTypes.ts";
import getCommitType from '../../../../utils/getCommitType.ts';
import * as React from "react";
import _ from 'lodash';

interface Props {
  commits: Commit[];
  selectedBranch: string;
  branches: string[];
  commitType: string;
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
}

export default (props: Props) => {
  const extractedCommitData = extractCommitData(props);
  const [commitChartData, setCommitChartData] = React.useState(extractedCommitData.commitChartData);
  const [maxTime, setMaxTime] = React.useState(extractedCommitData.maxTime);
  const [maxChange, setMaxChange] = React.useState(extractedCommitData.maxChange);

  React.useEffect(() => {
    const extractedCommitData = extractCommitData(props);
    setCommitChartData(extractedCommitData.commitChartData);
    setMaxTime(extractedCommitData.maxTime);
    setMaxChange(extractedCommitData.maxChange);
  }, [props]);

  return (<div>Content</div>);
};

const extractCommitData = (props: Props): { commitChartData: CommitChartData[]; maxTime: { estimated: number; actual: number; }; maxChange: number; } => {
  if (!props.commits || props.commits.length === 0) {
    return { commitChartData: [], maxTime: {estimated: 0, actual: 0}, maxChange: 0 };
  }

  const filteredCommits = props.commits.filter((value, index, array) => array.findIndex((el) => el.date === value.date) === index);
  const commitsWithDate = filteredCommits.map(commit => {
    return {...commit, date : new Date(commit.date), commitType: [], timeSpent: {estimated: 0, actual: 0}};
  })
  addTypeToCommits(commitsWithDate)
  const sortedCommits = commitsWithDate.sort((a, b) => a.date.getTime() - b.date.getTime());
  addActualTime(sortedCommits);
  addEstimatedTime(sortedCommits, props);
  const commitChartData = commitsWithDate.map((c, i) => {
    return {
      commitType: c.commitType,
      timeSpent: c.timeSpent,
      commitLink: c.webUrl,
      lineChanges: c.stats.additions + c.stats.deletions,
      commitMessage: c.message,
      date: c.date,
      author: c.signature.substring(0, c.signature.indexOf('<') - 1)};
  });

  const maxTime = {estimated: Math.max(...commitChartData.map(data => data.timeSpent.estimated)),
    actual: Math.max(...commitChartData.map(data => data.timeSpent.actual))};
  const maxChange = Math.max(...commitChartData.map(data => data.lineChanges));
  console.log({ commitChartData: commitChartData, maxTime: maxTime, maxChange: maxChange});
  return { commitChartData: commitChartData, maxTime: maxTime, maxChange: maxChange};
};

const firstCommitAdd = 120; // TODO: Replace constant with variable from state;
const maxCommitDiff = 120; // TODO: Replace constant with variable from state;

function addEstimatedTime(commits: any[], props: Props) {

  const mergedAuthors = [...props.mergedAuthors].filter(author => props.selectedAuthors.includes(author.mainCommitter));
  mergedAuthors.forEach(mergedAuthor => {
    const filteredCommits = commits.filter(commit => _.map(mergedAuthor.committers, 'signature').includes(commit.signature));
    if (filteredCommits.length === 0) {
      return;
    }
    filteredCommits[0].timeSpent.estimated = firstCommitAdd;
    let prevCommit = filteredCommits.shift();
    let curCommit = filteredCommits.shift();
    while (curCommit != null) {
      if ((curCommit.date.getTime() - prevCommit.date.getTime()) / 1000 / 60 > maxCommitDiff) {
        curCommit.timeSpent.estimated = firstCommitAdd;
      } else {
        curCommit.timeSpent.estimated = Math.round((curCommit.date.getTime() - prevCommit.date.getTime()) / 1000 / 60);
      }
      prevCommit = curCommit;
      curCommit = filteredCommits.shift();
    }
  });
}

function addActualTime(commits: any[]) {
  return commits.forEach(c => {
    let timeSpent = 0;
    const regex = 'Time-spent: [0-9]*h[0-9]*m';

    const timeStamp = c.message.match(regex);
    if (timeStamp) {
      const time = timeStamp.split(' ')[1];
      timeSpent = +time.substring(0, time.indexOf('h')) * 60
        + +time.substring(time.indexOf('h') + 1, time.indexOf('m'));
    }
    c.timeSpent = {actual: timeSpent};
  });
}

function addTypeToCommits(commits: any[]) {
  commits.forEach(c => {
      c.commitType = getCommitType(c.message);
    }
  )
}
