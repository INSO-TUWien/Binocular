'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import * as zoomUtils from '../../../utils/zoom.js';
import ThemeRiverChart from '../../../components/ThemeRiverChart';
import moment from 'moment';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    const {commitChartData, commitScale} = this.extractCommitData(props);
    const {issueChartData, issueScale} = this.extractIssueData(props);
    const {ciChartData, ciScale} = this.extractCIData(props);

    this.state = {
      commitChartData,    //Data for commit changes
      issueChartData,
      ciChartData,
      commitScale: commitScale,    //Maximum change in commit changes graph, used for y-axis scaling
      issueScale: issueScale,
      ciScale: ciScale
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const {commitChartData, commitScale} = this.extractCommitData(nextProps);
    const {issueChartData, issueScale} = this.extractIssueData(nextProps);
    const {ciChartData, ciScale} = this.extractCIData(nextProps);
    this.setState(
      {
        commitChartData,
        issueChartData,
        ciChartData,
        commitScale: commitScale,
        issueScale: issueScale,
        ciScale: ciScale
      });
  }

  render() {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartLine}>
          <div className={styles.text}>
            CI System
          </div>
          <div className={styles.chart}>
            <ThemeRiverChart content={this.state.ciChartData}
                             palette={{succeeded: "#26ca3b", failed: "#e23b41"}}
                             paddings={{top: 20, left: 40, bottom: 20}}
                             xAxisCenter={true}
                             yScale={1}
                             yDims={this.state.ciScale}
                             d3offset={d3.stackOffsetDiverging}
                             d3bugfix={{seriesNumber: 1}}/>
          </div>
        </div>
        <div className={styles.chartLine}>
          <div className={styles.text}>
            Issues
          </div>
          <div className={styles.chart}>
            <ThemeRiverChart content={this.state.issueChartData}
                             palette={{openCount: "#3461eb", closedCount: "#8099e8"}}
                             paddings={{top: 20, left: 40, bottom: 20}}
                             xAxisCenter={true}
                             yScale={1}
                             yDims={this.state.issueScale}
                             d3offset={d3.stackOffsetDiverging}
                             d3bugfix={{seriesNumber: 1}}/>
          </div>
        </div>
        <div className={styles.chartLine}>
          <div className={styles.text}>
            Changes
          </div>
          <div className={styles.chart}>
            <ThemeRiverChart content={this.state.commitChartData}
                             palette={this.props.palette}
                             paddings={{top: 20, left: 40, bottom: 20}}
                             yScale={2}
                             yDims={this.state.commitScale}
                             d3offset={d3.stackOffsetSilhouette}/>
          </div>
        </div>
      </div>
    );
  }

  extractIssueData(props){
    if(!props.issues || props.issues.length === 0)
      return {};

    //---- STEP 1: FILTER ISSUES ----
    let filteredIssues = [];
    switch(props.showIssues){
      case 'all':
        filteredIssues = props.issues;
        break;
      case 'open':
        _.each(props.issues, (issue) => {
          if(issue.closedAt == null)
            filteredIssues.push(issue);
        });
        break;
      case 'closed':
        _.each(props.issues, (issue) => {
          if(issue.closedAt)
            filteredIssues.push(issue);
        });
        break;
    }

    //---- STEP 2: AGGREGATE ISSUES PER TIME INTERVAL ----
    let data = [];
    let granularity = Dashboard.getGranularity(props.chartResolution);
    let interval = granularity.asMilliseconds();
    let curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).toDate().getTime();
    let next = curr + interval;
    let sortedCloseDates = [];
    let createdDate = Date.parse(props.issues[0].createdAt);

    for(let i=0, j=0; curr < props.lastSignificantTimestamp; curr = next, next += interval){                   //Iterate through time buckets
      let obj = {date: curr, count: 0, openCount: 0, closedCount: 0};                            //Save date of time bucket, create object

      while(i < filteredIssues.length && createdDate < next && createdDate >= curr){               //Iterate through issues that fall into this time bucket (open date)
        if(createdDate > curr && createdDate < next){
          obj.count++;
          obj.openCount++;
        }
        if(filteredIssues[i].closedAt) {    //If issues are closed, save close date in sorted list
          const closedDate = Date.parse(filteredIssues[i].closedAt);
          const insertPos = _.sortedIndex(sortedCloseDates, closedDate);
          sortedCloseDates.splice(insertPos, 0, closedDate);
        }
        if(++i < filteredIssues.length)
          createdDate = Date.parse(filteredIssues[i].createdAt);
      }
      for(;j < sortedCloseDates.length && sortedCloseDates[j] < next && sortedCloseDates[j] >= curr; j++){         //Iterate through issues that fall into this time bucket (closed date)
        if(sortedCloseDates[j] > curr && sortedCloseDates[j] < next){
          sortedCloseDates.splice(j,1);
          obj.count++;
          obj.closedCount++;
        }
      }
      data.push(obj);
    }

    //---- STEP 3: CONSTRUCT CHART DATA FROM AGGREGATED ISSUES ----
    const issueChartData = [];
    const issueScale = [0,0];
    _.each(data, function(issue){
      issueChartData.push({date: issue.date, openCount: issue.openCount, closedCount: (issue.closedCount > 0) ? (issue.closedCount*(-1)) : 0});
      if(issueScale[1] < issue.openCount)
        issueScale[1] = issue.openCount;
      if(issueScale[0] > issue.closedCount*(-1))
        issueScale[0] = issue.closedCount*(-1);
    });

    return {issueChartData, issueScale};
  }

  extractCIData(props) {
    if(!props.builds || props.builds.length === 0)
      return {};

    //---- STEP 1: AGGREGATE BUILDS PER TIME INTERVAL ----
    let data = [];
    let granularity = Dashboard.getGranularity(props.chartResolution);
    let interval = granularity.asMilliseconds();
    let curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).toDate().getTime();
    let next = curr + interval;
    for(let i=0; curr < props.lastSignificantTimestamp; curr = next, next += interval){       //Iterate through time buckets
      let obj = {date: curr, succeeded: 0, failed: 0};  //Save date of time bucket, create object
      for(; i < props.builds.length && Date.parse(props.builds[i].createdAt) < next; i++){             //Iterate through commits that fall into this time bucket
        let buildDate = Date.parse(props.builds[i].createdAt);
        if(buildDate >= curr && buildDate < next){
          obj.succeeded += (props.builds[i].stats.success || 0);
          obj.failed += (props.builds[i].stats.failed || 0);
        }
      }
      data.push(obj);
    }

    //--- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED BUILDS ----
    let ciChartData = [];
    let ciScale = [0,0];
    _.each(data, function(build){
      ciChartData.push({date: build.date, succeeded: build.succeeded, failed: (build.failed > 0) ? (build.failed*(-1)) : 0});
      if(ciScale[1] < build.succeeded)
        ciScale[1] = build.succeeded;
      if(ciScale[0] > build.failed*(-1))
        ciScale[0] = build.failed*(-1);
    });

    return {ciChartData, ciScale};
  }

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
    let data = [];
    //let granularity = Dashboard.getGranularity(props.resolution);
    let granularity = Dashboard.getGranularity(props.chartResolution);
    let interval = granularity.asMilliseconds();
    let curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).toDate().getTime();
    let next = curr + interval;
    for(let i=0; curr < props.lastSignificantTimestamp; curr = next, next += interval){       //Iterate through time buckets
      let obj = {date: curr, totals: {count: 0, changes: 0}, statsByAuthor: {}};  //Save date of time bucket, create object
      for(; i < props.commits.length && Date.parse(props.commits[i].date) < next; i++){             //Iterate through commits that fall into this time bucket
        let changes = props.commits[i].stats.additions + props.commits[i].stats.deletions;
        let commitAuthor = props.commits[i].signature;
        obj.totals.count++;
        obj.totals.changes += changes;
        if(commitAuthor in obj.statsByAuthor)                                     //If author is already in statsByAuthor, add to previous values
          obj.statsByAuthor[commitAuthor] = {count: obj.statsByAuthor[commitAuthor].count+1, changes: obj.statsByAuthor[commitAuthor].changes + changes};
        else                                                                      //Else create new values
          obj.statsByAuthor[commitAuthor] = {count: 1, changes: changes};

      }
      data.push(obj);
    }

    //--- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED COMMITS ----
    const commitChartData = [];
    let commitScale = 0;
    _.each(data, function(commit){                     //commit has structure {date, totals: {count, additions, deletions, changes}, statsByAuthor: {}} (see next line)}
      let obj = {date: commit.date};
      if(commit.totals.changes > commitScale)
        commitScale = commit.totals.changes;
      _.each(props.committers, function(committer){                       //commitLegend to iterate over authorNames, commitLegend has structure [{name, style}, ...]
        if(committer in commit.statsByAuthor)
          obj[committer] = commit.statsByAuthor[committer].changes;         //Insert number of changes with the author name as key, statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
        else
          obj[committer] = 0;
      });
      commitChartData.push(obj);                                //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...], e.g. series names are the authors with their corresponding values

    return { commitChartData, commitScale: [commitScale/-2, commitScale/2]};
  }

  static getGranularity(resolution) {
    switch(resolution){
      case 'years':
        return moment.duration(1, 'year');
      case 'months':
        return moment.duration(1, 'month');
      case 'weeks':
        return moment.duration(1, 'week');
      case 'days':
        return moment.duration(1, 'day');
    }
  }
}
