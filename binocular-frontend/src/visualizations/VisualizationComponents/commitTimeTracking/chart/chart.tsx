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
  commitType: {label: string; value: number}[];
}


export default (props: Props) => {
  const [commitChartData, setCommitChartData] = React.useState<CommitChartData[]>([]);
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      setCommitChartData(await extractCommitData(props));
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
    if (numberOfPages > 1) drawNavigation(numberOfPages);
  };

  const drawNavigation = function (numberOfPages: number) {
    const height = 25;

    const svgLeftArrow = d3.select("#navigation")
      .html("")
      .append("svg")
      .attr("width", 25)
      .attr("height", height);

    if (page > 0 && numberOfPages > 1) {
      svgLeftArrow.append("path")
        .attr("d", "M20,0 L20,25 L0,12.5 Z")
        .attr("class", "arrowhead")
        .on("click", () => setPage(page - 1)
        );
    }

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

    if (page + 1 < numberOfPages) {
      svgRightArrow.append("path")
        .attr("d", "M5,0 L5,25 L25,12.5 Z")
        .attr("class", "arrowhead")
        .on("click", () => setPage(page + 1));
    }
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
  const width = ((visualViewport?.width ?? 1920) - 511 - margin.left - margin.right) * (data.length / 50.0);
  const height = (visualViewport?.height ? (visualViewport?.height - 40 - 25) / 2 : 427) - margin.bottom;

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
    .domain([0, d3.max(data, d => d.timeSpent.estimated) || 0])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(['corrective', 'features', 'unknown', 'nonfunctional', 'perfective'])
    .unknown('#000000')
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);

  svg.append("g")
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.date.toString())!)
    .attr("y", d => y(d.timeSpent.estimated))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.timeSpent.estimated))
    .attr("fill", d => color(d.commitType[0].label) as string);
}

function drawNodeChart(data: CommitChartData[]) {
  const margin = { top: 5, right: 30, bottom: 5, left: 40 };
  const width = ((visualViewport?.width ?? 1920) - 511 - margin.left - margin.right) * (data.length / 50.0);
  const height = 40;

  const svg = d3.select("#nodeChart")
    .html("")
    .append("svg")
    .attr("width", '100%')
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.date.toString()))
    .range([0, width])
    .padding(0.1);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#f4d5a6")
    .style("border", "1px solid #000")
    .style("padding", "10px")
    .style("display", "none")
    .style("border-radius", "10px")
    .style("opacity", 0.9);

  svg.selectAll(".node")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("cx", d => (x(d.date.toString()) ?? 0) + x.bandwidth() / 2)
    .attr("cy", height / 2 - Math.min(15, x.bandwidth() / 2) / 3)
    .attr("r", Math.min(15, x.bandwidth() / 2))
    .on("click", (event, d) => {
      tooltip
        .html(`
            Author: ${d.author}<br>
            Date: ${d.date.toLocaleDateString()}<br>
            Lines changed: ${d.lineChanges} lines<br>
            Time spent: ${d.timeSpent.estimated} minutes<br>
            Commit type: ${d.commitType[0].label}<br>
            <a href="${d.commitLink}" target=”_blank”>Link to commit</a>`)
        .style("display", "block");

      const tooltipWidth = +(tooltip.style('width').substring(0, tooltip.style('width').length - 2));
      const tooltipHeight = +tooltip.style('height').substring(0, tooltip.style('height').length - 2);
      tooltip
        .style("left", `${event.x - tooltipWidth / 2}px`)
        .style("top", `calc(50% - ${35 + tooltipHeight}px)`);

    });

  d3.select(document).on("click", event => {
    const target = event.target;
    if (!target.closest(".node") && !target.closest(".tooltip")) {
      tooltip.style("display", "none");
    }
  });
}

function drawLowerChart(data: CommitChartData[]) {
  const margin = {top: 0, right: 30, bottom: 40, left: 40};
  const width = ((visualViewport?.width ?? 1920) - 511 - margin.left - margin.right) * (data.length / 50.0);
  const height = (visualViewport?.height ? (visualViewport?.height - 40 - 25) / 2 : 427) - margin.bottom;

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
    .domain([0, d3.max(data, d => Math.log2(d.lineChanges)) || 0])
    .nice()
    .range([0, height]);

  const color = d3.scaleOrdinal()
    .domain(['corrective', 'features', 'unknown', 'nonfunctional', 'perfective'])
    .unknown('#000000')
    .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']);

  svg.append("g")
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.date.toString())!)
    .attr("y", 0)
    .attr("width", x.bandwidth())
    .attr("height", d => d.lineChanges <= 0 ? 0 : y(Math.log2(d.lineChanges)) < 1 ? 1 : y(Math.log2(d.lineChanges)))
    .attr("fill", d=> color(d.commitType[0].label) as string);
}

const extractCommitData = async (props: Props): Promise<CommitChartData[]> => {
  if (!props.commits || props.commits.length === 0) {
    return [];
  }

  const filteredCommits = props.commits.filter((value, index, array) => array.findIndex((el) => el.date === value.date) === index);
  const commitsWithDate = filteredCommits.map(commit => {
    return {...commit, date : new Date(commit.date), commitType: [{label: 'unknown', value: 1}], timeSpent: {estimated: 0, actual: 0}};
  })
  await addTypeToCommits(commitsWithDate)
  const sortedCommits = commitsWithDate.sort((a, b) => a.date.getTime() - b.date.getTime());
  addActualTime(sortedCommits);
  addEstimatedTime(sortedCommits, props);
  return commitsWithDate.map(c => {
    return {
      commitType: c.commitType,
      timeSpent: c.timeSpent,
      commitLink: c.webUrl,
      lineChanges: c.stats.additions + c.stats.deletions,
      commitMessage: c.message,
      date: c.date,
      author: c.signature.substring(0, c.signature.indexOf('<') - 1)
    };
  });
};

function addEstimatedTime(commits: any[], props: Props) {
  const firstCommitAdd = 120; // TODO: Replace constant with variable from state;
  const maxCommitDiff = 120; // TODO: Replace constant with variable from state;
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
        c.commitType = commitType.map((type: { label: string; value: any; }) => {
          return {label: type.label.substring(9), value: type.value};
        });
      }
    }
}
