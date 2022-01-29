'use strict';

import React from 'react';
import * as d3 from 'd3';
import { myprototyp } from './prototyp.js'
import cx from 'classnames';
import ScriptTag from 'react-script-tag';


import { collectPages, graphQl } from '../../../utils';
import { fetchFactory, timestampedActionFactory } from '../../../sagas/utils.js';

import styles from '../styles.scss';
import _ from 'lodash';
import Axis from './Axis.js';
import GridLines from './GridLines.js';
import StackedArea from './StackedArea.js';

import Legend from '../../../components/Legend';
import ZoomableChartContainer from '../../../components/svg/ZoomableChartContainer.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import * as zoomUtils from '../../../utils/zoom.js';
import fetchRelatedCommits from '../sagas/fetchRelatedCommits.js';
import LocEvolutionConfig from '../config.js';

async function visualize() {

  const dataArr = new Array();
  const dateArr = new Array();

  //Here we will have to change to take the path + files from user selected input, this serves as a placeholder until that functionality is implemented
  let prefix = "ui/src/visualizations/code-ownership-river/chart/";
  let allFilesArr = ["Axis.js", "chart.js", "CommitMarker.js", "CommitMarker.scss", "GridLines.js", "index.js", "StackedArea.js"]

  //for each file we want in our Visualization, we need to send a query to the DB to fetch all the commits in which the file is mentioned. From the commits, we get data like
  //additions, deletions and date of commit, which is all needed for our Visualization
  for (const indFile of allFilesArr) {
    let queryRes = await getRelatedCommits(prefix + indFile, 100);
    //comments are here because we maybe outsource this function / the data-request in the future
    //var mycoolvar = fetchRelatedCommits.getRelatedCommits
    //var mycoolvar = fetchFactory.getRelatedCommits("ui/src/visualizations/code-ownership-transfer/chart.js", 10)

    let commits = queryRes.file.commits.data

    //for each of the commits where the file has been featured, we look into the commit to find the date and number of additions & deletions on this file
    for (let j = 0; j < commits.length; j++) {
      let fileArr = commits[j].files.data;
      for (let i = 0; i < fileArr.length; i++) { //the query on the commits doesn't let us restrict the filename, therefore we need to check all the files in the commit and pick ours
        if (fileArr[i].file.path === prefix + indFile) {
          let additions = fileArr[i].stats.additions;
          let deletions = fileArr[i].stats.deletions;
          let netchanges = additions - deletions;

          let tempObject = new Object();
          tempObject.date = new Date(commits[j].date); //convert strings to timestamps
          dateArr.push(tempObject.date);
          tempObject[indFile] = netchanges;
          dataArr.push(tempObject);
        }
      }
    }
  }

  //Sort for date
  dataArr.sort((a, b) => a.date - b.date);
  dateArr.sort((a, b) => a - b);

  //Merging of the Objects with same Date, e.g. Obj1{date: 1.1., file1: x}, Obj2{date: 1.1., file2: y} => Obj1{date 1.1., file1:x, file2:y}
  let flag = true;
  let tempDateArr = new Array();
  while (flag) { //do this while there are still duplicate dates in the Object Array
    tempDateArr = [];
    for (let index = 0; index < dataArr.length - 1; index++) {
      if (+dataArr[index + 1].date.getTime() === +dataArr[index].date.getTime()) { //check for each Object whether other Objects with same dates exist, if so, merge them
        dataArr[index] = Object.assign(dataArr[index], dataArr[index + 1]) //merging of the objects
        dataArr.splice(index + 1, 1) //removing the second Object from the Array
      }
      tempDateArr.push(dataArr[index].date.toLocaleTimeString())
    }
    //Check whether there are still duplicate Datetimes in the Array
    flag = hasDuplicates(tempDateArr)
  }
  const maxValues = new Array();

  //Filling the Objects with Files, which haven't had commits on a specific Date
  for (const filename of allFilesArr) {
    let tempVar = 0;
    let i = 0;
    for (i; i < dataArr.length; i++) {
      if (!dataArr[i].hasOwnProperty(filename)) {
        dataArr[i][filename] = tempVar;
      } else {
        dataArr[i][filename] += tempVar
        tempVar = dataArr[i][filename]
      }
    }
    maxValues.push(tempVar)
  }

  console.warn("2nd: ", JSON.stringify(dataArr))
  // set the dimensions and margins of the graph
  var margin = { top: 50, right: 30, bottom: 0, left: 0 },
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(10,20)");

  var keys = allFilesArr;

  var minDate = Math.min(...dateArr);
  var maxDate = Math.max(...dateArr);

  // Add X axis
  // Skala zu Timestamp machen hier
  var xScale = d3.scaleLinear()
    .domain([minDate, maxDate])
    .nice()
    .range([0, width - 100]);


  svg.append("g")
    .attr("transform", "translate(0,320)")
    .call(d3.axisBottom(xScale).tickSize(-height * .7).tickFormat(d3.timeFormat("%Y-%m-%d")))
    .select(".domain").remove()

  // Customization
  svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 30)
    .text("Time (year)");

  // Add Y axis
  var yScale = d3.scaleLinear()
    .domain([-200, 500])
    .range([100, height]);

  // color palette
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSpectral[10]); //Color Change here

  //LEGEND AQUI
  // Add one dot in the legend for each name.
  svg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", 10)
    .attr("cy", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) { return color(d) })

  // Add names for the legend.
  svg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 30)
    .attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) { return color(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  //stack the data
  var stackGen = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys);

  var stackedSeries = stackGen(dataArr)
  console.log(stackedSeries)


  // create a tooltip
  var Tooltip = svg
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 0)
    .style("font-size", 17)

  // Three functions that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    Tooltip.style("opacity", 1)
    d3.selectAll(".myArea").style("opacity", .2)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

  var mousemove = function (d, i) { //not changed yet - but not priority yet
    //svg.select("line").remove();
    var coordinates = d3.pointer(d);
    var mousex = coordinates[0];
    var invertedx = xScale.invert(mousex);
    var hoverDate = new Date(invertedx);
    var currIndex = 0;
    var currFileValue;
    var closeDatesArr = findClosest(dateArr, hoverDate);
    var closeDateBefore = closeDatesArr[0];
    var file = d3.select(this).data()[0].key; //currently selected/highlighted file
    console.warn(dataArr);
    console.warn(stackedSeries);
    for (let i = 0; i < dataArr.length; i++) {
      if (dataArr[i].date === closeDateBefore) {
        currIndex = i;
        currFileValue = dataArr[i][file]
      }
    }
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    Tooltip.text("On " + months[hoverDate.getMonth()] + " " + hoverDate.getDate() + ", " + hoverDate.getFullYear() + " the File: " + 
    file + " had a total line count of: " + currFileValue + ". The last commit to the file was on " +  months[closeDateBefore.getMonth()] + " " + closeDateBefore.getDate() + 
    ", " + closeDateBefore.getFullYear() + " and added " + currFileValue + " lines of Code.");

    /* --------------------------- White Vertical Line Here -------------- */
    /*svg.append("line")
      .attr("x1", mousex)
      .attr("y1", 0)
      .attr("x2", mousex)
      .attr("y2", height - margin.top - margin.bottom)
      .style("stroke-width", 2)
      .style("stroke", "white")
      .style("fill", "none");*/
  }

  var mouseleave = function (d) {
    Tooltip.style("opacity", 0)
    d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    //d3.selectAll("line").style("opacity", 1).style("stroke", "none")
  }

  var mouseclick = function (d, i) {
    var mousex = d3.pointer(this);
    mousex = mousex[0];
    var invertedx = x.invert(mousex);
    var year = Math.floor(invertedx)
    var dmp = arr[(year - 2000)]
    var result = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
    for (let index = 0; index < result.length; index++) {
      if (result[index][0] === keys[i]) {
        yVal = parseInt(result[index][1], 10)
      }
    }
    Tooltip.text("Value of " + keys[i] + " in " + year + " is: " + yVal)
  }

  // Area generator
  var data = dataArr
  var area = d3.area()
    .x(function (d) { return xScale(d.data.date); })
    .y0(function (d) { return yScale(d[0]); })
    .y1(function (d) { return yScale(d[1]); });

  // Show the areas -------------------------- For some reason this doesn't work. Stacking works, maybe error here or in Area Generator
  svg.selectAll("mylayers")
    .data(stackedSeries)
    .enter()
    .append("path")
    .attr("class", "myArea")
    .style("fill", function (d) { return color(d.key); })
    .attr("d", area)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("click", mouseclick);
}

function findClosest(a, x) {
  var lo, hi;
  for (var i = a.length; i--;) {
    if (a[i] <= x && (lo === undefined || lo < a[i])) lo = a[i];
    if (a[i] >= x && (hi === undefined || hi > a[i])) hi = a[i];
  }
  return [lo, hi];
}

export default class locEvolution extends React.Component {
  constructor(props) {
    super(props);

    const elements = this.extractCommitData(props);
    this.elems = {};
    this.state = {
      elements
    };
    this.updateDomain(props);
    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: true, margin: 50 });
    visualize();
  }

  get getFiles() {
    return files;
  }

  updateDomain(data) {

    if (!data.commits) {
      return;
    }
  }

  componentDidMount() {
    //visualize();
  }

  componentWillReceiveProps(nextProps) {
    const { fileURL, branch, path } = nextProps;
    this.setState({ path: path });
    this.setState({ branch: branch });
    this.setState({ fileURL: fileURL });
  }

  render() {
    return (
      <div id="my_dataviz"></div>
    )
  }

  activateLegend(legend) {
    this.setState({ hoverHint: legend });
  }

  extractCommitData(props) {
    const elements = ["File11", "File21", "File31"];
    return elements;
  }
}

const openIssuesLegend = {
  name: 'Open issues',
  style: {
    fill: '#ff9eb1',
    stroke: '#ff3860'
  }
};

const closedIssuesLegend = {
  name: 'Closed issues',
  style: {
    fill: '#73e79c'
  }
};

const unsuccessfulBuildsLegend = {
  name: 'Unsuccessful builds',
  style: {
    fill: '#ff9eb1',
    stroke: '#ff3860'
  }
};

const successfulBuildsLegend = {
  name: 'Successful builds',
  style: {
    fill: '#73e79c'
  }
};


async function getRelatedCommits(filename, perPage) {
  var myresp;
  await graphQl
    .query(
      `query commitsForSpecificFile($filename: String!, $perPage: Int) {
        file(path: $filename) {
          id
          path
          commits(page: 1, perPage: $perPage) {
            data {
              date
              files {
                data {
                  file {
                    path
                  }
                  stats {
                    additions
                    deletions
                  }
                }
              }
            }
          }
        }
      }`,
      { filename, perPage }
    )
    .then(resp => myresp = resp)
  return myresp
};

function hasDuplicates(a) {

  const noDups = new Set(a);

  return a.length !== noDups.size;
}