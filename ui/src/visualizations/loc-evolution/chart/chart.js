'use strict';

import React from 'react';
import * as d3 from 'd3';
import { myprototyp } from './prototyp.js'
import cx from 'classnames';
import ScriptTag from 'react-script-tag';

import styles from '../styles.scss';
import _ from 'lodash';
import Axis from './Axis.js';
import GridLines from './GridLines.js';
import CommitMarker from './CommitMarker.js';
import StackedArea from './StackedArea.js';

import Legend from '../../../components/Legend';
import ZoomableChartContainer from '../../../components/svg/ZoomableChartContainer.js';
import OffsetGroup from '../../../components/svg/OffsetGroup.js';
import * as zoomUtils from '../../../utils/zoom.js';

const dateExtractor = d => d.date;
const arr = new Array();  //test mit var
const testkeys = new Array();

async function visualize() {

  // Parse the Data
  d3.csv("../../../../assets/mockdata.csv", async function (data) {
    arr.push(data)
    testkeys.push(data.date)
  })

  //console.warn(testkeys)
  // set the dimensions and margins of the graph
  var margin = { top: 50, right: 30, bottom: 0, left: 10 },
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

  // List of groups = header of the csv files
  //var keys = testkeys
  //var keys = arr.columns.slice(1);
  var keys = ["file1", "file2", "file3", "file4", "file5", "file6", "file7", "file9", "file8", "file10"]

  // Add X axis
  var x = d3.scaleLinear()
    //.domain(d3.extent(Object.values(data), function (d) { return d.date; }))   <-------- date ist ein problem hier!
    .domain([2000, 2018])
    .range([100, width - 100]);
  svg.append("g")
    .attr("transform", "translate(0,320)")
    .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
      2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]))
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
  var y = d3.scaleLinear()
    .domain([-500, 400])
    .range([height, 0]);

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

  //stack the data?
  var stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(keys)
    (arr)

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
    var coordinates = d3.pointer(d);
    var mousex = coordinates[0];
    var mousey = coordinates[1];
    var invertedx = x.invert(mousex);
    var year = Math.floor(invertedx); //year which corresponds with the x position of the mouse in the chart
    //var result = recursiveFunction(arr, year, 0, arr.length)
    var dmp = arr[(year - 2000)] //CHANGE ME ---- I AM CHEATING HERE
    var result = Object.keys(dmp).map((key) => [String(key), dmp[key]]); //Object from the Data corresponding to the current selected year, e.g. row in the csv
    var file = d3.select(this).data()[0].key; //currently selected/highlighted file
    for (let index = 0; index < result.length; index++) {
      if (result[index][0] === file) {
        var yVal = parseInt(result[index][1], 10)
      }
    }
    Tooltip.text("Value of " + file + " in " + year + " is: " + yVal)

    /* --------------------------- White Vertical Line Here --------------
    svg.append("line")
      .attr("x1", mousex)
      .attr("y1", 0)
      .attr("x2", mousex)
      .attr("y2", height - margin.top - margin.bottom)
      .style("stroke-width", 2)
      .style("stroke", "white")
      .style("fill", "none");
      */
  }

  //Binary Search Here
  /*let recursiveFunction = function (tempArr, x, start, end) {

    // Base Condition
    if (start >= end) return false;

    // Find the middle index
    let mid = Math.floor((start + end) / 2);
    //console.warn("Mid: " + mid + " " + end)

    //Make Data accessible
    var dmp = tempArr[mid]
    //console.warn("dmp: " + dmp)
    var objectArray = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
    var value = parseInt(objectArray[0][1], 10);
    //console.warn("value = " + value)

    // Compare value at mid with given key x
    if (value === x) return objectArray;

    // If element at mid is greater than x,
    // search in the left half of mid
    if (value > x)
      return recursiveFunction(tempArr, x, start, mid - 1);
    else

      // If element at mid is smaller than x,
      // search in the right half of mid
      return recursiveFunction(tempArr, x, mid + 1, end);
  }*/

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
    var dmp = arr[(year - 2000)] //CHANGE ME ---- I AM CHEATING HERE
    var result = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
    for (let index = 0; index < result.length; index++) {
      if (result[index][0] === keys[i]) {
        yVal = parseInt(result[index][1], 10)
      }
    }
    Tooltip.text("Value of " + keys[i] + " in " + year + " is: " + yVal)
  }

  var values = arr.values()
  for (let index = 0; index < values.length; index++) {
    const element = values[index];
    console.warn(element);
  }

  // Area generator
  var area = d3.area()
    .x(function (d) { return x(d.data.date); })
    .y0(function (d) { return y(d[0]); })
    .y1(function (d) { return y(d[1]); })

  // Show the areas
  svg.selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", "myArea")
    .style("fill", function (d) { return color(d.key); })
    .attr("d", area)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("click", mouseclick)

}

export default class locEvolution extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};

    const { commitSeries, lastCommitDataPoint, commitLegend } = this.extractCommitData(props);
    this.state = {
      dirty: true,
      isPanning: false,
      lastCommitDataPoint,
      commitLegend,
      commitSeries,
      dimensions: zoomUtils.initialDimensions()
    };

    const x = d3.scaleTime().rangeRound([0, 0]);
    const y = d3.scaleLinear().rangeRound([0, 0]);

    this.scales = {
      x,
      y,
      scaledX: x,
      scaledY: y
    };

    this.commitExtractors = {
      x: d => d.date
    };

    this.updateDomain(props);
    this.onResize = zoomUtils.onResizeFactory(0.7, 0.7);
    this.onZoom = zoomUtils.onZoomFactory({ constrain: true, margin: 50 });
  }

  updateDomain(data) {
    if (!data.commits) {
      return;
    }

    const commitDateExtent = d3.extent(data.commits, d => d.date);
    const commitCountExtent = [0, _.last(data.commits).totals.count];

    const issueDateExtent = d3.extent(data.issues, d => d.createdAt);
    const issueCountExtent = d3.extent(data.issues, d => d.count);

    const buildDateExtent = d3.extent(data.builds, b => b.date);
    const buildCountExtent = d3.extent(data.builds, b => b.stats.total);

    const min = arr => _.min(_.pull(arr, null));
    const max = arr => _.max(_.pull(arr, null));

    this.scales.x.domain([
      min([commitDateExtent[0], issueDateExtent[0], buildDateExtent[0]]),
      max([commitDateExtent[1], issueDateExtent[1], buildDateExtent[1]])
    ]);

    this.scales.y.domain([
      min([this.scales.y.domain()[0], commitCountExtent[0], issueCountExtent[0], buildCountExtent[0]]),
      max([this.scales.y.domain()[1], commitCountExtent[1], issueCountExtent[1], buildCountExtent[1]])
    ]);
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    const { commitSeries, lastCommitDataPoint, commitLegend } = this.extractCommitData(nextProps);
    this.setState(
      {
        lastCommitDataPoint,
        commitSeries,
        commitLegend
      },
      () => this.updateDomain(nextProps)
    );
  }

  render() {
    visualize();
    return (
      <div id="my_dataviz"></div>
    )
  }

  activateLegend(legend) {
    this.setState({ hoverHint: legend });
  }

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    const lastCommitDataPoint = _.last(props.commits).statsByAuthor;
    const commitLegend = [];
    const commitSeries = _.map(lastCommitDataPoint, (committerIndex, signature) => {
      const legend = {
        name:
          (props.commitAttribute === 'count' ? 'Commits by ' : 'Changes by ') +
          (signature === 'other' ? props.otherCount + ' Others' : signature),
        style: {
          fill: props.palette[signature]
        }
      };

      commitLegend.push(legend);

      return {
        style: {
          fill: props.palette[signature]
        },
        extractY: d => {
          const stats = d.statsByAuthor[signature];

          if (props.commitAttribute === 'count') {
            return stats ? stats.count : 0;
          } else {
            return stats ? stats.changes / d.totals.changes * d.totals.count : 0;
          }
        },
        onMouseEnter: () => this.activateLegend(legend),
        onMouseLeave: () => this.activateLegend(null)
      };
    });

    return { commitSeries, commitLegend };
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
