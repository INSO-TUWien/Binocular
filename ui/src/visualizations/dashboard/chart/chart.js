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

    const { commitSeries, commitLegend, commitChartData, maxChange } = this.extractCommitData(props);

    this.state = {
      commitLegend,
      commitSeries,
      commitChartData,    //Data for commit changes
      maxChange: maxChange    //Maximum change in commit changes graph, used for y-axis scaling
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { commitSeries, commitLegend, commitChartData, maxChange } = this.extractCommitData(nextProps);
    this.setState(
      {
        commitSeries,
        commitLegend,
        commitChartData,
        maxChange: maxChange
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

          </div>
        </div>
        <div className={styles.chartLine}>
          <div className={styles.text}>
            Issues
          </div>
          <div className={styles.chart}>

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
                             yDims={[this.state.maxChange/-2,this.state.maxChange/2]}
                             d3offset={d3.stackOffsetSilhouette}/>
          </div>
        </div>
      </div>
    );
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
    let maxChange = 0;
    _.each(props.commits, function(commit){                     //commit has structure {date, totals: {count, additions, deletions, changes}, statsByAuthor: {}} (see next line)}
      let obj = {date: commit.date};
      if(commit.totals.changes > maxChange)
        maxChange = commit.totals.changes;
      _.each(commitLegend, function(legendEntry){                       //commitLegend to iterate over authorNames, commitLegend has structure [{name, style}, ...]
        if(legendEntry.name in commit.statsByAuthor)
          obj[legendEntry.name] = commit.statsByAuthor[legendEntry.name].changes;         //Insert number of changes with the author name as key, statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
        else
          obj[legendEntry.name] = 0;
      });
      commitChartData.push(obj);                                //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...], e.g. series names are the authors with their corresponding values

    return { commitSeries, commitLegend, commitChartData, maxChange };
  }
}
