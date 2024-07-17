import {Author, Committer} from '../../../../types/authorTypes.ts';
import {Commit} from "../../../../types/commitTypes.ts";
import getCommitType from '../../../../utils/getCommitType.ts';
import * as React from "react";
import _ from 'lodash';
import * as d3 from 'd3';

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
  commitType: [{label: string; value: number}];
}


export default (props: Props) => {
  const [commitChartData, setCommitChartData] = React.useState<CommitChartData[]>([]);
  const [maxTime, setMaxTime] = React.useState({ estimated: 0, actual: 0 });
  const [maxChange, setMaxChange] = React.useState(0);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      const extractedCommitData = await extractCommitData(props);
      setCommitChartData(extractedCommitData.commitChartData);
      setMaxTime(extractedCommitData.maxTime);
      setMaxChange(extractedCommitData.maxChange);
    };

    fetchData();
  }, [props]);

  React.useEffect(() => {
    if (commitChartData.length > 0) {
      console.log(commitChartData);
      const numberOfPages = Math.ceil(commitChartData.length / 50.0);
      drawChart(commitChartData, numberOfPages);
    }
  }, [commitChartData, page]);

  const drawChart = (data: CommitChartData[], numberOfPages: number) => {
    const pagedData = data.slice(page * 50, 50 + page * 50);
    drawUpperChart(pagedData);
    drawNodeChart(pagedData);
    drawLowerChart(pagedData);
    drawNavigation(numberOfPages);
  };

  const drawNavigation = function (numberOfPages: number) {
    const height = 25;

    // Create the SVG container
    const svgLeftArrow = d3.select("#navigation")
      .html("")
      .append("svg")
      .attr("width", 25)
      .attr("height", height);

    svgLeftArrow.append("path")
      .attr("d", "M20,0 L20,25 L0,12.5 Z")
      .attr("class", "arrowhead")
      .on("click", () => {
        if (page < 1) {
          return;
        }
        setPage(page - 1);
      });

    const inputDiv = d3.select("#navigation")
      .append("div")
      .attr("style", `vertical-align: top; width: 75; height: ${height}; display: inline`);

    const input = inputDiv
      .append("input")
      .attr("type", "text")
      .attr("style", `text-align: center;font-size: 16px; width: 20; height: ${height}`)
      .attr('value', page + 1)
      .on("change", (e) => {
        if (isNaN(e.target.value)) {
          e.target.value = "";
        }
        if (+e.target.value > 0 && +e.target.value <= numberOfPages) {
          setPage(+e.target.value - 1);
        }
      });

    const pageNumber = inputDiv
      .append("span")
      .attr("style", `width: 20; height: ${height}`)
      .html(`/${numberOfPages}`);

    const svgRightArrow = d3.select("#navigation")
      .append("svg")
      .attr("width", 25)
      .attr("height", height);

    // Append the arrowhead path directly to the SVG container
    svgRightArrow.append("path")
      .attr("d", "M5,0 L5,25 L25,12.5 Z")
      .attr("class", "arrowhead")
      .on("click", () => {
        if (page + 1 >= numberOfPages) {
          return;
        }
        setPage(page + 1);
      });
  }

  return (
    <span style={{height: '100%'}}>
      <div id="upperChart" style={{height: 'calc(50% - 42.5px)'}}>upperChart</div>
      <div id="nodeChart" style={{height: '40px'}}> Nodes </div>
      <div id="lowerChart" style={{height: 'calc(50% - 42.5px)'}}>lowerChart</div>
      <div id="navigation" style={{margin: '10px 0px 10px 10px', fill: 'black', height: '25px'}}></div>
    </span>
  );
};

function drawUpperChart(data: CommitChartData[]) {
  const margin = {top: 40, right: 30, bottom: 0, left: 40};
  const width = visualViewport?.width - 511 - margin.left - margin.right;
  const height = 449.5 - margin.top;

  const svg = d3.select("#upperChart")
    .html("")
    .append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.date.toString()))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.timeSpent.estimated)])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(['corrective', 'features', 'unknown', 'nonfunctional', 'perfective'])
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);

  svg.append("g")
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.date.toString()))
    .attr("y", d => y(d.timeSpent.estimated))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.timeSpent.estimated))
    .attr("fill", d => color(d.commitType[0].label));
}

function drawNodeChart(data: CommitChartData[]) {
  const margin = { top: 5, right: 30, bottom: 5, left: 40 };
  const width = visualViewport?.width - 511 - margin.left - margin.right || 600; // Fallback width
  const height = 40;

  const svg = d3.select("#nodeChart")
    .html("")
    .append("svg")
    .attr("width", '100%')
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create a scale for x based on the number of nodes
  const x = d3.scaleBand()
    .domain(data.map(d => d.date.toString()))
    .range([0, width])
    .padding(0.1);

  // Append circles (nodes) along the x-axis
  svg.selectAll(".node")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("cx", d => x(d.date.toString()) + x.bandwidth() / 2) // Center the node along x-axis
    .attr("cy", height / 2 - Math.min(15, x.bandwidth() / 2) / 3) // Place nodes at the middle of the chart
    .attr("r", Math.min(15, x.bandwidth() / 2)) // Radius of the nodes
    .attr("stroke", "#000") // Add a border around nodes
    .attr("stroke-width", 1); // Width of the border
}

function drawLowerChart(data: CommitChartData[]) {
  const margin = {top: 0, right: 30, bottom: 40, left: 40};
  const width = visualViewport?.width - 511 - margin.left - margin.right;
  const height = 449.5 - margin.bottom; // Define the height of the chart area

  const svg = d3.select("#lowerChart")
    .html("")
    .append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.date.toString()))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.log2(d.lineChanges))])
    .nice()
    .range([0, height]);

  const color = d3.scaleOrdinal()
    .domain(['corrective', 'features', 'unknown', 'nonfunctional', 'perfective'])
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);

  svg.append("g")
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.date.toString()))
    .attr("y", 0) // Set y to 0 to start from the top
    .attr("width", x.bandwidth())
    .attr("height", d => d.lineChanges <= 0 ? 0 : y(Math.log2(d.lineChanges)) < 1 ? 1 : y(Math.log2(d.lineChanges))) // Height is directly proportional to the estimated time spent
    .attr("fill", d => color(d.commitType[0].label));
}

const extractCommitData = async (props: Props): Promise<{ commitChartData: CommitChartData[]; maxTime: { estimated: number; actual: number; }; maxChange: number; }> => {
  if (!props.commits || props.commits.length === 0) {
    return { commitChartData: [], maxTime: {estimated: 0, actual: 0}, maxChange: 0 };
  }

  const filteredCommits = props.commits.filter((value, index, array) => array.findIndex((el) => el.date === value.date) === index);
  const commitsWithDate = filteredCommits.map(commit => {
    return {...commit, date : new Date(commit.date), commitType: [], timeSpent: {estimated: 0, actual: 0}};
  })
  await addTypeToCommits(commitsWithDate)
  const sortedCommits = commitsWithDate.sort((a, b) => a.date.getTime() - b.date.getTime());
  addActualTime(sortedCommits);
  addEstimatedTime(sortedCommits, props);
  const commitChartData = commitsWithDate.map(c => {
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

async function addTypeToCommits(commits: any[]) {
  for (const c of commits) {
      const commitType = (await getCommitType(c.message));
      if (!commitType || commitType.length === 0) {
        c.commitType = [{label: 'unknown', value: 1}];
      } else {
        c.commitType = commitType.map(type => {
          return {label: type.label.substring(9), value: type.value};
        });
      }
    }
}
