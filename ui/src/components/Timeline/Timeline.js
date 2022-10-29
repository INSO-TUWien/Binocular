'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
import React from 'react';

export default class Timeline extends React.Component {
  state = {
    colorCycle: [
      '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78',
      '#2ca02c', '#98df8a', '#d62728', '#ff9896',
      '#9467bd', '#c5b0d5', '#8c564b', '#c49c94',
      '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7',
      '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
    ],
    labelMarginLeft: 5,
    issuesStats: {
      scaleFactor: 1,
      height: 20,
      margin: 20,
      startTime: 0,
      endTime: 0,
      rowCount: 0,
    },
    tickFormat: {
      format: d3.timeFormat("%I %p"),
      tickTime: d3.timeHour,
      tickInterval: 1,
      tickSize: 6
    },
    defaultValues: {
      margin: { left: 100, right: 30, top: 0, bottom: 0 },
      width: 750,
    }
  }

  constructor(props, styles) {
    super(props);

    if (this.props.data == null) {
      console.error("Data have to be passed to Timeline!");
    }

  }

  componentDidMount() {
    if (this.props.data == null){
      this.appendAxis(d3.select(this.svg));
    } else {
      // this.appendAxis();
      // d3.select('#timeline')
      this.appendIssues(d3.select('#timeline'));
    }
  }

  appendAxis(parent) {
    var xScale = d3.scaleTime().range([this.state.defaultValues.margin.left, this.state.defaultValues.width - this.state.defaultValues.margin.right]);
    const axis = d3.axisBottom(xScale);

    parent.append("g").attr('class','axis').attr('width', 10).call(axis);
  }

  appendLabel(parent, yAxisMapping, rowId, hasLabel, datum) {
    var fullIssueHeight = this.state.issuesStats.height + this.state.issuesStats.margin;
    var rowsDown = this.props.margin.top + fullIssueHeight / 2 + fullIssueHeight * (yAxisMapping[rowId] || 1);

    parent.append('text')
      .attr('class', 'timeline-label')
      .attr('transform', 'translate(' +  this.state.labelMarginLeft + ',' + rowsDown + ')')
      .text(hasLabel ? datum.label : datum.id)
      .on('click', function (d, i) {
        click(d, rowId, datum);
      });
  }

  calcIssueDrawProperties(g) {
    let minTime = this.state.issuesStats.startTime;
    let maxTime = this.state.issuesStats.endTime;
    let rowCount = 1;
    let yAxisMapping = [];

    // check how many rows ar needed and how max start and endtime of the issues is
    if (this.state.issuesStats.startTime === 0 || this.state.issuesStats.endTime === 0) {
      const data = this.props.data.mockData;

      if (data != null) {
        data.forEach((currdata, index) => {
          // create y mapping for stacked graph
          if (Object.keys(yAxisMapping).indexOf(index) == -1) {
            yAxisMapping[index] = rowCount;
            rowCount++;
          }

          // figure out beginning and ending times if they are unspecified
          currdata.times.forEach(function (time, i) {

            if (time.starting_time < minTime || (minTime === 0)) {
              minTime = time.starting_time;
            }
            if (time.ending_time > maxTime) {
              maxTime = time.ending_time;
            }
          });
        })
      }

      this.state.issuesStats.rowCount = rowCount;
      this.state.issuesStats.startTime = minTime;
      this.state.issuesStats.endTime = maxTime;

      let timeDiff = maxTime - minTime;
      let widthWithoutMargin = this.state.defaultValues.width - this.state.defaultValues.margin.left - this.state.defaultValues.margin.right;
      //debugger;
      this.state.issuesStats.scaleFactor = (1/timeDiff) * widthWithoutMargin;
    }
  }
  
  appendIssues (gParent) {
    let g = gParent.append("g");
    let gParentSize = gParent.nodes()[0].getBoundingClientRect();
    let gParentItem = d3.select(gParent._groups[0][0]);

    this.calcIssueDrawProperties(g);

    let margin = this.state.defaultValues.margin;

    // draw the axis
    let xScale = d3.scaleTime()
      .domain([this.state.issuesStats.startTime, this.state.issuesStats.endTime])
      .range([margin.left, this.state.defaultValues.width - margin.right]);

    let xAxis = d3.axisBottom(xScale)
      .tickFormat(this.state.tickFormat.format)
      .tickSize(this.state.tickFormat.tickSize)
      .ticks(this.state.tickFormat.tickTime, this.state.tickFormat.tickInterval);

    const currstate = this.state;
    const data = this.props.data.mockData;

    if (data != null) {

      // draw person
      data.forEach((person, index) => {
        let name = person.label;
        let issueArr = person.times;

        // draw issues of a person
        issueArr.forEach((data, issueIndex) => {
          const xPosition = this.state.defaultValues.margin.left
            + (data.starting_time - this.state.issuesStats.startTime) * this.state.issuesStats.scaleFactor;
          const yPosition = this.state.defaultValues.margin.top
            + (this.state.issuesStats.height + this.state.issuesStats.margin) * (index+1);
          const issueWidth = (data.ending_time - data.starting_time) * this.state.issuesStats.scaleFactor;

          g.datum({data, state: this.state})
            .append("rect")
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("width", issueWidth)
            .attr("height", this.state.issuesStats.height)
            .style("fill", this.state.colorCycle[index])
            .attr("class",  "timelineSeries_" + index)
            .attr("id", 'timelineItem_' + index + "_" + issueIndex)
          ;

          g.selectAll("svg").data(data).enter()
            .append("text")
            .attr("x", xPosition + 5)
            .attr("y", yPosition * 0.7)
            .text(function (d) {
              return d.label;
            })
          ;
        })

        // draw the label of the person
        var fullItemHeight    = this.state.issuesStats.height + this.state.issuesStats.margin;
        var rowsDown          = this.state.defaultValues.margin.top + (this.state.issuesStats.height/2)
          + fullItemHeight * (index+1);

        gParent.append("text")
          .attr("class", "timeline-label")
          .attr("transform", "translate(" + this.state.labelMarginLeft + "," + rowsDown + ")")
          .text(name)
          .on("click", function (d, i) { click(d, index, datum); });
      })
    };

    let timeAxisYPosition = (margin.top + (this.state.issuesStats.height + this.state.issuesStats.margin) * this.state.issuesStats.rowCount);

    this.appendAxis(g, xAxis, timeAxisYPosition);
  }


  render() {
    return (
      <svg id="timeline" style={{ width: "100%" }} ref={(svg) => (this.svg = svg)}>
        <g className="timeline" ref={(g) => (this.g = g)} />
      </svg>
  )
  }
}
