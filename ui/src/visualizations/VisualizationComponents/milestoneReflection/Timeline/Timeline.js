'use strict';

import * as d3 from 'd3';
import _ from 'lodash';
import React from 'react';

const MAX_SAFE_INTEGER = 9007199254740991;
export default class Timeline extends React.Component {
  state = {
    colorCycle: [
      '#aec7e8', '#ff7f0e', '#ffbb78', '#9edae5',
      '#bcbd22', '#dbdb8d', '#98df8a', '#d62728',
      '#9467bd', '#c5b0d5', '#17becf', '#c49c94',
      '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7',

    ],
    labelMarginLeft: 5,
    issuesStats: {
      scaleFactor: 1,
      height: 20,
      margin: 20,
      startTime: 0,
      endTime: 0,
      rowCount: 0,
      issueToolInfo: {
        vcs: {
          loc: {min: -1, max: -1}
        }, its: {
          time: {min: -1, max: -1}
        }, ci: {
          builds: {minSuccess: -1.1, maxSuccess: -1.1}
        }
      }
    },
    tickFormat: {
      format: d3.timeFormat("%d.%m"),
      tickTime:  14, // d3.timeHour.every(24) == every 12h, // utcHour
      tickInterval: 1,
      tickSize: 6
    },
    defaultValues: {
      margin: { left: 150, right: 30, top: 0, bottom: 0 },
      width: 750,
    },
    inputFieldJson: "",
    showInfo: null,
    componentDidMount: false
  }

  constructor(props, styles) {
    super(props);
  }

  componentDidMount() {
    this.drawTimeline();
  }

  drawTimeline() {
    this.state.componentDidMount = true;
    this.state.inputFieldJson = JSON.stringify(this.props.data.milestone);
    this.state.showInfo = this.props.data.showInfo;

    if (this.props?.data?.milestone == null){
      this.appendAxis(d3.select(this.gTimeline));
    } else {
      // get future boundaries of svg
      this.calcIssueDrawProperties();

      this.appendIssues();
    }
  }

  appendAxis(parent) {
    // calculate the axis
    let margin = this.state.defaultValues.margin;
    // + 1 for milestone row
    let yPosition = (margin.top + (this.state.issuesStats.height + this.state.issuesStats.margin) * (this.state.issuesStats.rowCount + 1));

    let xScale = d3.scaleTime()
      .domain([this.state.issuesStats.startTime, this.state.issuesStats.endTime])
      .range([margin.left, this.state.defaultValues.width - margin.right]);

    let xAxis = d3.axisBottom(xScale)
      .tickFormat(this.state.tickFormat.format)
      .tickSize(this.state.tickFormat.tickSize)
      .ticks(this.state.tickFormat.tickTime, this.state.tickFormat.tickInterval);


    parent.append("g")
      .attr('transform', 'translate(' + 0 + ',' + yPosition + ')')
      .attr('class','axis')
      .call(xAxis);
  }

  calcIssueDrawProperties() {
    let minTime = this.state.issuesStats.startTime;
    let maxTime = this.state.issuesStats.endTime;
    let rowCount = 1;

    let localToolInfos = {
      vcs: {
        loc: {min: MAX_SAFE_INTEGER, max: -1}
      }, its: {
        time: {min: MAX_SAFE_INTEGER, max: -1}
      }, ci: {
        builds: {minSuccessRate: 1.0, maxSuccessRate: 0.0}
      }
    };
    let buildRate;

    // check how many rows ar needed and how max start and endtime of the issues is
    if (this.state.issuesStats.startTime === 0 || this.state.issuesStats.endTime === 0) {
      const milestone = this.props.data.milestone;

      if (milestone != null) {
        milestone.issuesPerPerson.forEach((person, index) => {

          // figure out beginning and ending times if they are unspecified
          person.issueList.forEach(function (issue, i) {

            if (issue.its.timeStamps.issue_inProgress < minTime || (minTime === 0)) {
              minTime = issue.its.timeStamps.issue_inProgress ;}
            if (issue.its.timeStamps.issue_done > maxTime) {
              maxTime = issue.its.timeStamps.issue_done;}

            // calc metrik data
            if (localToolInfos.vcs.loc.min > issue.vcs.loc) {localToolInfos.vcs.loc.min = issue.vcs.loc;}
            if (localToolInfos.vcs.loc.max < issue.vcs.loc) {localToolInfos.vcs.loc.max = issue.vcs.loc;}
            if (localToolInfos.its.time.min > issue.its.minutesSpent) {localToolInfos.its.time.min = issue.its.minutesSpent;}
            if (localToolInfos.its.time.max < issue.its.minutesSpent) {localToolInfos.its.time.max = issue.its.minutesSpent;}

            buildRate = (issue.ci.successful / issue.ci.totalBuild);
            if (localToolInfos.ci.builds.minSuccessRate > buildRate) {localToolInfos.ci.builds.minSuccessRate = buildRate;}
            if (localToolInfos.ci.builds.maxSuccessRate < buildRate) {localToolInfos.ci.builds.maxSuccessRate = buildRate;}

          });
        })
      }

      this.state.issuesStats.rowCount = milestone.issuesPerPerson.length;
      this.state.issuesStats.startTime = minTime;
      this.state.issuesStats.endTime = maxTime;

      this.state.issuesStats.issueToolInfo = localToolInfos;

      let timeDiff = maxTime - minTime;
      let widthWithoutMargin = this.state.defaultValues.width - this.state.defaultValues.margin.left - this.state.defaultValues.margin.right;

      this.state.issuesStats.scaleFactor = (1/timeDiff) * widthWithoutMargin;
    }
  }

  drawMilestoneRow(gTimeline, milestone) {
    const xPosition = this.state.defaultValues.margin.left
      + (milestone.beginDate - this.state.issuesStats.startTime) * this.state.issuesStats.scaleFactor;
    const yPosition = this.state.defaultValues.margin.top; // * (index+1);
    const issueWidth = (milestone.endDate - milestone.beginDate) * this.state.issuesStats.scaleFactor;

    gTimeline
      .append("rect")
      .attr("x", xPosition)
      .attr("y", yPosition)
      .attr("width", issueWidth)
      .attr("height", this.state.issuesStats.height)
      .style("fill", "#29e40a")
      .attr("class",  "timelineSeries_milestone")
      .attr("id", 'timelineItem_' + (milestone.title).replace(" ", "-"))
    ;

    gTimeline
      .append("text")
      .attr("x", xPosition + issueWidth/2 - milestone.title.length * 3)
      .attr("y", yPosition + this.state.issuesStats.height * 0.75)
      .text(milestone.title)
    ;
  }

  onPersonLabelClick(personIssue) {
    let personText = personIssue.name + ": \n" + "  Issues in total: " + personIssue.issueList.length;
    if (personIssue.issueList.length > 0) {
      personText += "\n  Issues:";
      personIssue.issueList.forEach((issue) => {personText += "\n    - " + issue.title});
    }

    alert(personText)
  }

  onIssueClick(issue) {
    debugger;
    let issueText = "Issue: \t" + issue.issueName + "\n" +
                      "Assigned to: \t" + issue.assignedTo + "\n" +
                      "VCS Data: " + JSON.stringify(issue.vcs) + "\n" +
                      "ITS Data: " + JSON.stringify(issue.its) + "\n" +
                      "CI/CD Data: " + JSON.stringify(issue.ci) + "\n";
    alert(issueText)
  }

  drawIssueRows(gLabel, gTimeline, milestone) {
    let positionOffset = 1; // first row is milestone

    var fullItemHeight    = this.state.issuesStats.height + this.state.issuesStats.margin;
    var rowLabelOffset    = this.state.defaultValues.margin.top + (this.state.issuesStats.height/2);


    milestone.issuesPerPerson.forEach((personIssueData, index) => {
      let currentOffset = index + positionOffset; // start at 3. position
      let name = personIssueData.name;
      let issueArr = personIssueData.issueList;

      // draw the label of the person
      gLabel
        .append("text")
        .datum({onClick: this.onPersonLabelClick, person: personIssueData})
        .attr("class", "timeline-label")
        .attr("transform", "translate(" + this.state.labelMarginLeft + "," + (rowLabelOffset + fullItemHeight * (currentOffset)) + ")")
        .text(name)
        .on("click", (event, data) => {data.onClick(data.person);});

      // draw issues of a person
      issueArr.forEach((singleIssue, issueIndex) => {
        const xPosition = this.state.defaultValues.margin.left
          + (singleIssue.its.timeStamps.issue_inProgress - this.state.issuesStats.startTime) * this.state.issuesStats.scaleFactor;
        const yPosition = this.state.defaultValues.margin.top
          + (this.state.issuesStats.height + this.state.issuesStats.margin) * (currentOffset);
        const issueWidth = (singleIssue.its.timeStamps.issue_done - singleIssue.its.timeStamps.issue_inProgress) * this.state.issuesStats.scaleFactor;

        if (isNaN(issueWidth)) {
          debugger;
        }

        const yellow =  "#ffe147";
        const blue = "#2ca6ff";
        const grey = "#a1a1a1";

        let interpolate1 = d3.interpolateRgb(yellow, grey)
        let interpolate2 = d3.interpolateRgb(grey, blue)

        // colored background box
        gTimeline
          .append("rect")
          .datum({issue: singleIssue, state: this.state, interpolate1, interpolate2})
          .attr("x", xPosition)
          .attr("y", yPosition)
          .attr("width", issueWidth)
          .attr("height", this.state.issuesStats.height)
          .style("fill", (data, index, d3) => {
            let value, min, max, interpolation;

            switch (data.state.showInfo) {
              case "loc":
                value = data.issue.vcs.loc;
                min =  data.state.issuesStats.issueToolInfo.vcs.loc.min;
                max =  data.state.issuesStats.issueToolInfo.vcs.loc.max;
                break;
              case "time":
                value = data.issue.its.minutesSpent;
                min =  data.state.issuesStats.issueToolInfo.its.time.min;
                max =  data.state.issuesStats.issueToolInfo.its.time.max;
                break;
              case "builds":
                value = data.issue.ci.successful / data.issue.ci.totalBuild;
                min =  data.state.issuesStats.issueToolInfo.ci.builds.min;
                max =  data.state.issuesStats.issueToolInfo.ci.builds.max;
                break;
            }
            interpolation = (value-min)/(max-min);
            if (interpolation <= 0.5) {
              return interpolate1(interpolation);
            } else {
              return interpolate2(interpolation);
            }
          })
          .attr("class",  "timelineSeries_" + index)
          .attr("id", 'timelineItem_' + index + "_" + issueIndex)
        ;

        // issue label
        gTimeline
          .append("text").datum({data: singleIssue, state: this.state})
          .attr("x", xPosition + issueWidth/2 - singleIssue.issueName.length*3)
          .attr("y", yPosition + this.state.issuesStats.height * 0.75)
          .text(singleIssue.issueName)
        ;

        // transparent clickBox
        gTimeline
          .append("rect")
          .datum({onClick: this.onIssueClick, issue: singleIssue})
          .attr("x", xPosition)
          .attr("y", yPosition)
          .attr("width", issueWidth)
          .attr("height", this.state.issuesStats.height)
          .style("fill", "transparent")
          .on("click", (event, data) => {data.onClick(data.issue);})
        ;
      })
    })
  }

  appendIssues () {
    // extract data for easier readability
    const svgTimeline = d3.select(this.svgTimeline);
    const gTimeline = d3.select(this.gTimeline);
    const gLabel = d3.select(this.gLabel);
    const milestone = this.props.data.milestone;

    // delete potential old drawings
    gTimeline.selectAll("*").remove();
    gLabel.selectAll("*").remove();

    gTimeline.datum({milestone, state: this.state});

    if (milestone != null) {
      this.drawMilestoneRow(gTimeline, milestone);

      this.drawIssueRows(gLabel, gTimeline, milestone);
    };

    // draw axis
    this.appendAxis(gTimeline);

    let height = (this.state.defaultValues.margin.top + this.state.defaultValues.margin.bottom
      + (this.state.issuesStats.height + this.state.issuesStats.margin) * (this.state.issuesStats.rowCount + 2));
    // set svg height = axis position + axis height
    svgTimeline.node().style.height = height;
  }


  render() {
    if (this.state.componentDidMount) {
      if  (JSON.stringify(this.props.data.milestone) != JSON.stringify(this.state.inputFieldJson)) {
        this.drawTimeline();
      }

      if (this.state.showInfo != this.props.data.showInfo) {
        this.state.showInfo = this.props.data.showInfo;
        this.appendIssues();
      }
    }


    return (
      <svg id="timeline" style={{ width: "100%" }} ref={(svg) => (this.svgTimeline = svg)}>
        <g className="timeline" ref={(g) => (this.gTimeline = g)} />
        <g className="timeline-label" ref={(g) => (this.gLabel = g)} />
      </svg>
  )
  }
}
