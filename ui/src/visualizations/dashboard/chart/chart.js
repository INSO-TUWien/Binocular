'use strict';

import React from 'react';
import * as d3 from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import * as zoomUtils from '../../../utils/zoom.js';
import ThemeRiverChart from '../../../components/ThemeRiverChart';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    const { commitSeries, commitLegend, commitChartData, commitScale} = this.extractCommitData(props);
    const {issueChartData, issueScale} = this.extractIssueData(props);
    const {ciChartData, ciScale} = this.extractCIData(props);

    this.state = {
      commitLegend,
      commitSeries,
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
    const { commitSeries, commitLegend, commitChartData, commitScale} = this.extractCommitData(nextProps);
    const {issueChartData, issueScale} = this.extractIssueData(nextProps);
    const {ciChartData, ciScale} = this.extractCIData(nextProps);
    this.setState(
      {
        commitSeries,
        commitLegend,
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
                             paddings={{top: 10, left: 40, bottom: 10}}
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
                             paddings={{top: 10, left: 40, bottom: 10}}
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
                             paddings={{top: 10, left: 40, bottom: 20}}
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

    const issueChartData = [];
    const issueScale = [0,0];
    _.each(props.issues, function(issue){
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

    const ciChartData = [];
    const ciScale = [0,0];
    _.each(props.builds, function(build){
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

    const commitLegend = [];
    const commitSeries = _.map(Object.keys(props.palette), (signature) => {
      const legend = {
        name:
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
    const commitChartData = [];
    let commitScale = 0;
    _.each(props.commits, function(commit){                     //commit has structure {date, totals: {count, additions, deletions, changes}, statsByAuthor: {}} (see next line)}
      let obj = {date: commit.date};
      if(commit.totals.changes > commitScale)
        commitScale = commit.totals.changes;
      _.each(Object.keys(props.palette), function(signature){                       //commitLegend to iterate over authorNames, commitLegend has structure [{name, style}, ...]
        if(signature in commit.statsByAuthor)
          obj[signature] = commit.statsByAuthor[signature].changes;         //Insert number of changes with the author name as key, statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
        else
          obj[signature] = 0;
      });
      commitChartData.push(obj);                                //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...], e.g. series names are the authors with their corresponding values

    return { commitSeries, commitLegend, commitChartData, commitScale: [commitScale/-2, commitScale/2]};
  }
}
