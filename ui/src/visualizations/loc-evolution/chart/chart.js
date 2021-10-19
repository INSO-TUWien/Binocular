'use strict';

import React from 'react';
import * as d3 from 'd3';
import cx from 'classnames';

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

export default class locEvolution extends React.Component {
  constructor(props) {
    super(props);

    this.elems = {};

    d3.csv("../../../../assets/mockdata.csv", function(data) {
      console.log(data); // [{"Hello": "world"}, …]
    });

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

  //render mit meinem Code
  /*render() {

     // set the dimensions and margins of the graph
     var margin = { top: 20, right: 30, bottom: 0, left: 10 },
       width = 1200 - margin.left - margin.right,
       height = 500 - margin.top - margin.bottom;
 
     <svg ref={(svg) => (this.ref = svg)} />
 
     //d3.select(this.ref).doSomething();
 
     // Parse the Data
     d3.csv("../mockdata.csv", function (data) {
 
       // List of groups = header of the csv files
       var keys = data.columns.slice(1)
 
       // Add X axis
       var x = d3.scaleLinear()
         .domain(d3.extent(data, function (d) { return d.date; }))
         .range([100, width - 100]);
       d3.select(this.ref).append("g")
         .attr("transform", "translate(0," + height * 0.8 + ")")
         .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
           2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]))
         .select(".domain").remove()
       // Customization
       d3.select(this.ref).selectAll(".tick line").attr("stroke", "#b8b8b8")
 
       // Add X axis label:
       d3.select(this.ref).append("text")
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
       d3.select(this.ref).selectAll("mydots")
         .data(keys)
         .enter()
         .append("circle")
         .attr("cx", 10)
         .attr("cy", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
         .attr("r", 7)
         .style("fill", function (d) { return color(d) })
 
       // Add names for the legend.
       d3.select(this.ref).selectAll("mylabels")
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
         (data)
 
       // create a tooltip
       var Tooltip = d3.select(this.ref)
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
         mousex = d3.mouse(this);
         mousex = mousex[0];
         var invertedx = x.invert(mousex);
         year = Math.floor(invertedx)
         result = recursiveFunction(data, year, 0, data.length)
         //dmp = data[(year - 2000)] //CHANGE ME ---- I AM CHEATING HERE
         //var result = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
         for (let index = 0; index < result.length; index++) {
           if (result[index][0] === keys[i]) {
             yVal = parseInt(result[index][1], 10)
           }
         }
         Tooltip.text("Value of " + keys[i] + " in " + year + " is: " + yVal)
 
        //   --------------------------- White Vertical Line Here --------------
        //  svg.append("line")
        //    .attr("x1", mousex)
        //    .attr("y1", 0)
        //    .attr("x2", mousex)
        //    .attr("y2", height - margin.top - margin.bottom)
        //    .style("stroke-width", 2)
        //    .style("stroke", "white")
        //    .style("fill", "none");
      }
  
    //Binary Search Here
    let recursiveFunction = function (arr, x, start, end) {
  
      // Base Condition
      if (start > end) return false;
  
      // Find the middle index
      let mid = Math.floor((start + end) / 2);
  
      //Make Data accessible
      dmp = arr[mid]
      objectArray = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
      value = parseInt(objectArray[0][1], 10);
  
      // Compare value at mid with given key x
      if (value === x) return objectArray;
  
      // If element at mid is greater than x,
      // search in the left half of mid
      if (value > x)
        return recursiveFunction(arr, x, start, mid - 1);
      else
  
        // If element at mid is smaller than x,
        // search in the right half of mid
        return recursiveFunction(arr, x, mid + 1, end);
    }
  
    var mouseleave = function (d) {
      Tooltip.style("opacity", 0)
      d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
      //d3.selectAll("line").style("opacity", 1).style("stroke", "none")
    }
  
    var mouseclick = function (d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x.invert(mousex);
      year = Math.floor(invertedx)
      dmp = data[(year - 2000)] //CHANGE ME ---- I AM CHEATING HERE
      var result = Object.keys(dmp).map((key) => [String(key), dmp[key]]);
      for (let index = 0; index < result.length; index++) {
        if (result[index][0] === keys[i]) {
          yVal = parseInt(result[index][1], 10)
        }
      }
      Tooltip.text("Value of " + keys[i] + " in " + year + " is: " + yVal)
    }
  
    // Area generator
    var area = d3.area()
      .x(function (d) { return x(d.data.date); })
      .y0(function (d) { return y(d[0]); })
      .y1(function (d) { return y(d[1]); })
  
    // Show the areas
    d3.select(this.ref)
      .selectAll("mylayers")
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
  
  })
  
  
    return(
        <div id = "my_dataviz" >
        <script src="prototyp.js"></script>
        </div>
      )
  }*/
  
  //render mit vorhandenem Code
  render() {

    if (!this.props.commits) {
      return <svg />;
    }

    const legend = [
      {
        name: 'Commits by author',
        subLegend: this.state.commitLegend
      }
    ];

    if (this.props.issues.length > 0) {
      legend.push({
        name: 'Issues by state',
        subLegend: [openIssuesLegend, closedIssuesLegend]
      });
    }

    if (this.props.builds.length > 0) {
      legend.push({
        name: 'Builds by state',
        subLegend: [successfulBuildsLegend, unsuccessfulBuildsLegend]
      });
    }

    const x = this.scales.scaledX;
    const y = this.scales.scaledY;

    const dims = this.state.dimensions;
    const today = x(new Date());
    this.scales.x.rangeRound([0, dims.width]);
    this.scales.y.rangeRound([dims.height, 0]);

    const commitMarkers = this.props.highlightedCommits.map((c, i) => {
      // for each commit marker, we need to recalculate the correct
      // y-coordinate by checking where that commit would go in our
      // commit data points
      const j = _.sortedIndexBy(this.props.commits, c, other => other.date.getTime());

      const cBefore = this.props.commits[j - 1];
      const cAfter = this.props.commits[j];
      const span = cAfter.date.getTime() - cBefore.date.getTime();
      const dist = c.date.getTime() - cBefore.date.getTime();
      const pct = dist / span;

      const countDiff = cAfter.totals.count - cBefore.totals.count;

      return (
        <CommitMarker
          key={i}
          commit={c}
          x={x(c.date)}
          y={y(cBefore.totals.count + countDiff * pct)}
          onClick={() => this.props.onCommitClick(c)}
        />
      );
    });

    return (
      <ZoomableChartContainer
        scaleExtent={[1, Infinity]}
        onZoom={evt => {
          this.onZoom(evt);
          this.props.onViewportChanged(this.scales.scaledX.domain());
        }}
        onResize={dims => this.onResize(dims)}
        onStart={e =>
          this.setState({
            isPanning: e.sourceEvent === null || e.sourceEvent.type !== 'wheel'
          })}
        onEnd={() => this.setState({ isPanning: false })}
        className={cx(styles.chart, { [styles.panning]: this.state.isPanning })}>
        <g>
          <defs>
            <clipPath id="chart">
              <rect x="0" y="0" width={dims.width} height={dims.height} />
            </clipPath>
            <clipPath id="x-only">
              <rect x="0" y={-dims.hMargin} width={dims.width} height={dims.fullHeight} />
            </clipPath>
          </defs>
          <OffsetGroup dims={dims}>
            <GridLines orient="left" scale={y} ticks="10" length={dims.width} />
            <GridLines orient="bottom" scale={x} y={dims.height} length={dims.height} />
            <g>
              <Axis orient="left" ticks="10" scale={y} />
              <text x={-dims.height / 2} y={-50} textAnchor="middle" transform="rotate(-90)">
                Amount
              </text>
            </g>
            <g>
              <Axis orient="bottom" scale={x} y={dims.height} />
              <text x={dims.width / 2} y={dims.height + 50} textAnchor="middle">
                Time
              </text>
            </g>
            <g id="StackedArea1" clipPath="url(#chart)" className={cx(styles.commitCount)}>
              <StackedArea
                data={this.props.commits}
                series={this.state.commitSeries}
                d3offset={d3.stackOffsetDiverging}
                x={x}
                y={y}
                extractX={dateExtractor}
                sum={_.sum}
                fillToRight={today}
              />
              {commitMarkers}
            </g>
            {this.props.highlightedIssue &&
              <defs>
                <mask id="issue-mask">
                  <rect x={0} y={0} width={dims.width} height={dims.height} style={{ stroke: 'none', fill: '#ffffff', opacity: 0.5 }} />
                  <rect
                    x={x(this.props.highlightedIssue.createdAt)}
                    y={0}
                    width={Math.max(3, x(this.props.highlightedIssue.closedAt || new Date()) - x(this.props.highlightedIssue.createdAt))}
                    height={dims.height}
                    style={{ stroke: 'none', fill: '#ffffff' }}
                  />
                </mask>
              </defs>}
            <g id="StackedArea2" clipPath="url(#chart)" mask="url(#issue-mask)" className={cx(styles.openIssuesCount)}>
              <StackedArea
                data={this.props.issues}
                x={x}
                y={y}
                series={[
                  {
                    extractY: i => i.closedCount,
                    style: closedIssuesLegend.style,
                    className: styles.closedIssuesCount,
                    onMouseEnter: () => this.activateLegend(closedIssuesLegend),
                    onMouseLeave: () => this.activateLegend(null)
                  },
                  {
                    extractY: i => i.openCount,
                    style: openIssuesLegend.style,
                    onMouseEnter: () => this.activateLegend(openIssuesLegend),
                    onMouseLeave: () => this.activateLegend(null)
                  }
                ]}
                extractX={dateExtractor}
                sum={_.sum}
                fillToRight={today}
              />
            </g>
            <g id="StackedArea4" clipPath="url(#chart)" mask="url(#issue-mask)">
              <StackedArea
                data={this.props.builds}
                x={x}
                y={y}
                series={[
                  {
                    extractY: b => b.stats.success,
                    style: successfulBuildsLegend.style,
                    className: '',
                    onMouseEnter: () => this.activateLegend(successfulBuildsLegend),
                    onMouseLeave: () => this.activateLegend(null)
                  },
                  {
                    extractY: b => b.stats.failed,
                    style: unsuccessfulBuildsLegend.style,
                    onMouseEnter: () => this.activateLegend(unsuccessfulBuildsLegend),
                    onMouseLeave: () => this.activateLegend(null)
                  }
                ]}
                extractX={dateExtractor}
                sum={_.sum}
                fillToRight={today}
              />
            </g>
            <g className={styles.today} clipPath="url(#x-only)">
              <text x={today} y={-10}>
                Now
              </text>
              <line x1={today} y1={0} x2={today} y2={dims.height} />
            </g>
          </OffsetGroup>
          <Legend x="10" y="10" categories={this.state.hoverHint ? [this.state.hoverHint] : legend} />
        </g>
      </ZoomableChartContainer>
    );
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
