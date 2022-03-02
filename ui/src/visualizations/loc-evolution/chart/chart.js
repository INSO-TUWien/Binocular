'use strict';

import React from 'react';
import * as d3 from 'd3';

import { graphQl } from '../../../utils';

import _ from 'lodash';
import * as zoomUtils from '../../../utils/zoom.js';

async function visualize(props) {

  d3.select("#my_dataviz").selectAll("*").remove();

  // set the dimensions and margins of the graph
  var margin = { top: 100, right: 100, bottom: 100, left: 100 },
    width = 1600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(10,20)");

  const dataArr = new Array();
  const dateArr = new Array();
  var fileNameArr = new Array();
  var fileNameList = [];

  let prefix = props.highlightedFolder;

  //Query for File Names
  const resp = await Promise.resolve(
    graphQl.query(
      `
    query{
     files(sort: "ASC"){
        data{path,webUrl}
      }
    }
    `,
      {}
    )
  );
  fileNameArr = resp.files.data;

  //Filter them for currently selected Folder
  for (const i in fileNameArr) {
    var currPath = "";
    currPath = fileNameArr[i].path;
    if (currPath.includes(prefix)) { //check whether the path contains the desired directory
      currPath = currPath.substring(currPath.lastIndexOf("/") + 1); //Remove the directory from the filename
      if (currPath.length > 0 && !fileNameList.includes(currPath)) {
        fileNameList.push(currPath);
      }
    }
  }

  //for each file we want in our Visualization, we need to send a query to the DB to fetch all the commits in which the file is mentioned. From the commits, we get data like
  //additions, deletions and date of commit, which is all needed for our Visualization
  for (const indFile of fileNameList) {
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
  for (const filename of fileNameList) {
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

  var keys = fileNameList;

  var minDate = Math.min(...dateArr);
  var maxDate = Math.max(...dateArr);

  // Add X axis
  var xScale = d3.scaleLinear()
    .domain([minDate, maxDate])
    .range([200, width]);


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
    .text("Timespan over which these files existed and commits were made to them");

  // Add Y axis
  var yScale = d3.scaleLinear()
    .domain([-20, 50])
    .range([250, height - 100]); //change here to be more dynamic with different sizes

  // color palette
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSpectral[10]); //Color Change here

  //LEGEND
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

  var mousemove = function (d, i) {
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
    //find the commit nearest to the date reflecting the mouse's x position and associated total LoC count for said date
    for (let i = 0; i < dataArr.length; i++) {
      if (dataArr[i].date === closeDateBefore) {
        currIndex = i;
        currFileValue = dataArr[i][file]
      }
    }

    // Iterate over DataArr to search for the last commit containing the given file and extracting the amount of LoC changed in said commit
    var j = currIndex;
    var lastCommitValue = 0;
    while (j >= 0 || dataArr[j].date >= minDate) {
      lastCommitValue = currFileValue - dataArr[j][file];
      if (lastCommitValue != 0) {
        break;
      }
      j--;
    }
    var addSubtractString = "";
    addSubtractString = ((lastCommitValue > 0) ? "added " : "deleted ");
    lastCommitValue = Math.abs(lastCommitValue);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    Tooltip.text("On " + months[hoverDate.getMonth()] + " " + hoverDate.getDate() + ", " + hoverDate.getFullYear() + " the File: " +
      file + " had a total line count of: " + currFileValue + ". The last commit to the file was on " + months[closeDateBefore.getMonth()] + " " + closeDateBefore.getDate() +
      ", " + closeDateBefore.getFullYear() + " and " + addSubtractString + "a net total of " + lastCommitValue + " lines of Code.");

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
    mousemove(d,i);
  }

  // Area generator
  var data = dataArr
  var area = d3.area()
    .x(function (d) { return xScale(d.data.date); })
    .y0(function (d) { return yScale(d[0]); })
    .y1(function (d) { return yScale(d[1]); });

  // Show the areas
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

    this.updateDomain(props);
    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: true, margin: 50 });
    console.warn(this.props.highlightedFolder);
    visualize(props);
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
    visualize(this.props);
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    visualize(this.props);
    return (
      <div id="my_dataviz"></div>
    )
  }
}


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