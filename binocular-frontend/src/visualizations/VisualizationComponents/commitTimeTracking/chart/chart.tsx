import {Author, Committer, Palette} from '../../../../types/authorTypes.ts';
import {Commit} from "../../../../types/commitTypes.ts";

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
  console.log(extractCommitData(props))
  return (<div>Content</div>);
};

const extractCommitData = (props: Props): { commitChartData: CommitChartData[]; maxTime: { estimated: number; actual: number; }; maxChange: number; } => {
  if (!props.commits || props.commits.length === 0) {
    return { commitChartData: [], maxTime: {estimated: 0, actual: 0}, maxChange: 0 };
  }

  const filteredCommits = props.commits.filter((value, index, array) => array.findIndex((el) => el.date === value.date) === index);
  const commitsWithTime = addTimeToCommits(filteredCommits);
  const commitChartData = commitsWithTime.map((c, i) => {
    return {timeSpent: c.timeSpent,
      commitLink: c.webUrl,
      lineChanges: c.stats.additions + c.stats.deletions,
      commitMessage: c.message,
      author: c.signature.substring(0, c.signature.indexOf('<') - 1)};
  });

  const maxTime = {estimated: 0, actual: 0};

  return { commitChartData: commitChartData, maxTime: maxTime, maxChange: 0 };
};

function addTimeToCommits(commits: Commit[]) {
  return commits.map((c, i) => {
    return {...c, timeSpent: {estimated: i, actual: i}};
  });
}
