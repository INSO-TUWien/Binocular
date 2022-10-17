'use strict';

import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import {
  timeline,
  testData,
  rectAndCircleTestData,
  labelTestData,
  iconTestData,
  labelColorTestData,
  testDataWithColor,
  testDataWithColorPerTime,
  testDataRelative,
  width,
} from './timeline';
import moment from 'moment/moment';

export default class MilestoneReflection extends React.PureComponent {
  constructor(props) {
    super(props);
    // const { issueChartData, issueScale } = this.extractIssueData(props);
    // config: props.config,

    this.state = {
      //issueChartData,
      //issueScale,
    };
  }

  extractIssueData(props) {
    //debugger;
    if (!props.issues || props.issues.length === 0) {
      return {};
    }

    let firstTimestamp = props.firstCommitTimestamp;
    let lastTimestamp = props.lastCommitTimestamp;
    let issues = props.issues;
    if (props.universalSettings) {
      issues = props.filteredIssues;
      firstTimestamp = props.firstSignificantTimestamp;
      lastTimestamp = props.lastSignificantTimestamp;
    }
    //---- STEP 1: FILTER ISSUES ----
    let filteredIssues = [];
    switch (props.showIssues) {
      case 'all':
        filteredIssues = issues;
        break;
      case 'open':
        _.each(issues, (issue) => {
          if (issue.closedAt === null) {
            filteredIssues.push(issue);
          }
        });
        break;
      case 'closed':
        _.each(issues, (issue) => {
          if (issue.closedAt) {
            filteredIssues.push(issue);
          }
        });
        break;
      default:
    }

    if (props.universalSettings) {
      filteredIssues = filteredIssues.filter((issue) => {
        let filter = false;
        if (props.selectedAuthors.filter((a) => a === 'others').length > 0) {
          filter = true;
        }
        for (const author of Object.keys(props.allAuthors)) {
          const authorName = author.split('<')[0].slice(0, -1);
          if (issue.author.name === authorName) {
            if (props.selectedAuthors.filter((a) => a === author).length > 0) {
              filter = true;
              break;
            } else {
              filter = false;
              break;
            }
          }
        }
        return filter;
      });
    }

    //---- STEP 2: AGGREGATE ISSUES PER TIME INTERVAL ----
    const data = [];
    const granularity = this.getGranularity(props.chartResolution);
    const curr = moment(firstTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    const end = moment(lastTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const sortedCloseDates = [];
    let createdDate = Date.parse(issues[0].createdAt);

    for (let i = 0, j = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj = { date: currTimestamp, count: 0, openCount: 0, closedCount: 0 }; //Save date of time bucket, create object

      while (i < filteredIssues.length && createdDate < nextTimestamp && createdDate >= currTimestamp) {
        //Iterate through issues that fall into this time bucket (open date)
        if (createdDate > currTimestamp && createdDate < nextTimestamp) {
          obj.count++;
          obj.openCount++;
        }
        if (filteredIssues[i].closedAt) {
          //If issues are closed, save close date in sorted list
          const closedDate = Date.parse(filteredIssues[i].closedAt);
          const insertPos = _.sortedIndex(sortedCloseDates, closedDate);
          sortedCloseDates.splice(insertPos, 0, closedDate);
        }
        if (++i < filteredIssues.length) {
          createdDate = Date.parse(filteredIssues[i].createdAt);
        }
      }
      for (; j < sortedCloseDates.length && sortedCloseDates[j] < nextTimestamp && sortedCloseDates[j] >= currTimestamp; j++) {
        //Iterate through issues that fall into this time bucket (closed date)
        if (sortedCloseDates[j] > currTimestamp && sortedCloseDates[j] < nextTimestamp) {
          sortedCloseDates.splice(j, 1);
          obj.count++;
          obj.closedCount++;
        }
      }
      data.push(obj);
    }

    //---- STEP 3: CONSTRUCT CHART DATA FROM AGGREGATED ISSUES ----
    const issueChartData = [];
    const issueScale = [0, 0];
    _.each(data, function (issue) {
      issueChartData.push({
        date: issue.date,
        Opened: issue.openCount,
        Closed: issue.closedCount > 0 ? issue.closedCount * -1 : -0.001,
      }); //-0.001 for stack layout to realize it belongs on the bottom
      if (issueScale[1] < issue.openCount) {
        issueScale[1] = issue.openCount;
      }
      if (issueScale[0] > issue.closedCount * -1) {
        issueScale[0] = issue.closedCount * -1;
      }
    });

    return { issueChartData, issueScale };
  }

  /* possible frameworks:
     3d.js MIT license
      https://codepen.io/manglass/pen/MvLBRz
      https://www.cssscript.com/timelines-chart-svg/ https://github.com/denisemauldin/d3-timeline
      https://observablehq.com/@tezzutezzu/world-history-timeline

   */

  timelineHover() {
    var chart = timeline()
      .width(width * 4)
      .stack()
      .margin({ left: 70, right: 30, top: 0, bottom: 0 })
      .hover(function (d, i, datum) {
        // d is the current rendering object
        // i is the index during d3 rendering
        // datum is the id object
        var div = $('#hoverRes');
        var colors = chart.colors();
        div.find('.coloredDiv').css('background-color', colors[i]);
        div.find('#name').text(datum.label);
      })
      .click(function (d, i, datum) {
        alert(datum.label);
      });
    /* .scroll(function (x, scale) {
        $('#scrolled_date').text(scale.invert(x) + ' to ' + scale.invert(x + width));
      })*/ var svg = d3.select('#timeline3').append('svg').attr('width', width).datum(labelTestData).call(chart);
  }

  render() {
    return (
      <div>
        <h3>A stacked timeline with hover, click, and scroll events</h3>
        <div>current config selected:
          <p>config.issueInfo: {this.props.config.issueInfo}</p>
          <p>config.milestone: {this.props.config.milestone? this.props.config.milestone.title : 'not selected'}</p>
        </div>

        <div id="timeline3"></div>
        <div id="hoverRes">
          <div className="coloredDiv"></div>
          <div id="name"></div>
          <div id="scrolled_date"></div>
        </div>
      </div>
    );
  }
}

// timelineRect();
// timelineRectNoAxis();
// timelineCircle();
// timelineRectAndCircle();
// timelineHover();
//   timelineStackedIcons();
//   timelineLabelColor();
//    timelineRotatedTicks();
//    timelineRectColors();
//    timelineRectColorsPerTime();
//    timelineRelativeTime();
//  timelineAxisTop();
//  timelineBgndTick();
//   timelineBgnd();
//  timelineComplex();
