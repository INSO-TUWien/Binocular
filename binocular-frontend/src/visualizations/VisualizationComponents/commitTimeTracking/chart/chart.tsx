import {Author, Committer} from '../../../../types/authorTypes.ts';
import {Commit} from "../../../../types/commitTypes.ts";
import getCommitType from '../../../../utils/getCommitType.ts';
import * as React from "react";

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
  console.log(commitChartData);

  return (<div>Content</div>);
};

const extractCommitData = (props: Props): { commitChartData: CommitChartData[]; maxTime: { estimated: number; actual: number; }; maxChange: number; } => {
  if (!props.commits || props.commits.length === 0) {
    return { commitChartData: [], maxTime: {estimated: 0, actual: 0}, maxChange: 0 };
  }

  const filteredCommits = props.commits.filter((value, index, array) => array.findIndex((el) => el.date === value.date) === index);
  const commitsWithTime = addTimeToCommits(addTypeToCommits(filteredCommits));
  const commitChartData = commitsWithTime.map((c, i) => {
    return {
      commitType: c.commitType,
      timeSpent: c.timeSpent,
      commitLink: c.webUrl,
      lineChanges: c.stats.additions + c.stats.deletions,
      commitMessage: c.message,
      author: c.signature.substring(0, c.signature.indexOf('<') - 1)};
  });

  const maxTime = {estimated: 0, actual: 0};
  return { commitChartData: commitChartData, maxTime: maxTime, maxChange: 0 };
};

function addTimeToCommits(commits: any[]) {
  return commits.map((c, i) => {
    const timeSpent = {estimated: i, actual: i};
    const regex = 'Time-spent: [0-9]*h[0-9]*m';
    const timeStamp = c.message.match(regex);
    if (timeStamp) {
      const time = timeStamp.split(' ')[1];
      timeSpent.actual = +time.substring(0, time.indexOf('h')) * 60
        + +time.substring(time.indexOf('h') + 1, time.indexOf('m'));
    }
    return {...c, timeSpent: timeSpent};
  });
}

function addTypeToCommits(commits: Commit[]) {
  return commits.map((c) => {
    return {...c, commitType : getCommitType(c.message)};
  })
}
