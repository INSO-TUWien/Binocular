'use strict';

import React from 'react';
import { min, max, stackOffsetDiverging } from 'd3';

import styles from '../styles.scss';
import _ from 'lodash';

import moment from 'moment';
import chroma from 'chroma-js';
import { createStreamKey, DataRiverChartComponent } from '../../../components/DataRiverChart/data-river-chart.component';
import cx from 'classnames';
import { RiverData, BuildStat } from '../../../components/DataRiverChart/RiverData';

export default class LanguageModuleRiver extends React.Component {
  constructor(props) {
    super(props);

    const { commitChartData, commitScale, commitPalette, selectedAuthors } = this.extractCommitData(props);
    const { issueChartData, issueScale } = this.extractIssueData(props);
    const { ciChartData, ciScale } = this.extractCIData(props);

    this.state = {
      commitChartData, //Data for commit changes
      issueChartData,
      ciChartData,
      commitScale, //Maximum change in commit changes graph, used for y-axis scaling
      issueScale,
      ciScale,
      commitPalette,
      selectedAuthors
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { commitChartData, commitScale, commitPalette, selectedAuthors } = this.extractCommitData(nextProps);
    //const { issueChartData, issueScale } = this.extractIssueData(nextProps);
    //const { ciChartData, ciScale } = this.extractCIData(nextProps);
    this.setState({
      commitChartData,
      //issueChartData,
      //ciChartData,
      commitScale,
      //issueScale,
      //ciScale,
      commitPalette,
      selectedAuthors
    });
  }

  render() {
    if (this.props.palette) {
      console.log(Object.keys(this.props.palette));
    }

    let commitOrder;
    if (this.props.palette) {
      commitOrder = Object.keys(this.props.palette);
    }

    const commitOffset = (series, order) => {
      series, order;
    }; //d3.stackOffsetDiverging;
    const commitPalette = this.state.commitPalette;

    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const date = new Date('2020-10-17');
    let mockData;
    if (commitOrder) {
      mockData = [
        new RiverData(addDays(date, 1), 'ts', commitOrder[0], 'a1', BuildStat.Failed, 1, 100, 2),
        new RiverData(addDays(date, 1), 'js', commitOrder[1], 'a1', BuildStat.Success, 0.1, 1000, 2),
        new RiverData(addDays(date, 2), 'js', commitOrder[1], 'a2', BuildStat.Failed, 1, 4, 2000),
        new RiverData(addDays(date, 3), 'js', commitOrder[1], 'a3', BuildStat.Skipped, 1, 140, 1200),
        new RiverData(addDays(date, 4), 'js', commitOrder[1], 'a4', BuildStat.Success, 1, 1004, 120),
        new RiverData(addDays(date, 5), 'js', commitOrder[1], 'a5', BuildStat.Success, 1, 200, 12),
        new RiverData(addDays(date, 5), 'ts', commitOrder[0], 'a5', BuildStat.Success, 1, 1000, 2),
        new RiverData(addDays(date, 6), 'js', commitOrder[2], 'a6', BuildStat.Success, 1, 2002, 2),
        new RiverData(addDays(date, 3), 'js', commitOrder[2], 'a7', BuildStat.Success, 1, 1000, 2),
        new RiverData(addDays(date, 4), 'js', commitOrder[2], 'a8', BuildStat.Success, 1, 2002, 2100),
        new RiverData(addDays(date, 5), 'js', commitOrder[2], 'a9', BuildStat.Failed, 1, 1002, 20)
      ];
    }

    /*
    const palette = chroma.scale('spectral').mode('lch').colors(mockData.length).reduce((map, color, index) => {
      map[mockData[index].sha] = color;
      return map;
    }, {});*/

    const commitChart = (
      <div className={styles.chartLine}>
        <div className={cx(styles.text, 'label')}>Attribute River</div>
        <div className={styles.chart}>
          <DataRiverChartComponent
            content={mockData}
            palette={commitPalette}
            paddings={{ top: 20, left: 60, bottom: 20, right: 30 }}
            xAxisCenter={true}
            //yDims={this.state.commitScale}
            d3offset={commitOffset}
            keys={
              this.state.selectedAuthors
                ? this.state.selectedAuthors.map(author => author.replace(/\((.*)\)\s+/gi, '')).reduce((data, author) => {
                    data.push(createStreamKey({ name: author, attribute: 'js' }));
                    data.push(createStreamKey({ name: author, attribute: 'ts' }));
                  return data;
                }, [])
                : undefined
            }
            resolution={this.props.chartResolution}
            displayNegative={true}
            order={commitOrder}
            hideVertical={false}
            attribute={'Language'}
          />
        </div>
      </div>
    );

    //const commitChart = <DataRiverChartComponent dataset={mockData} colorPalette={palette} />;

    const loadingHint = (
      <div className={styles.loadingHintContainer}>
        <h1 className={styles.loadingHint}>
          Loading... <i className="fas fa-spinner fa-pulse" />
        </h1>
      </div>
    );

    return (
      <div className={styles.chartContainer}>
        {this.state.ciChartData === null && this.state.issueChartData === null && this.state.commitChartData === null && loadingHint}
        {this.state.commitChartData && commitChart}
      </div>
    );
  }

  extractIssueData(props) {
    if (!props.issues || props.issues.length === 0) {
      return {};
    }

    //---- STEP 1: FILTER ISSUES ----
    let filteredIssues = [];
    switch (props.showIssues) {
      case 'all':
        filteredIssues = props.issues;
        break;
      case 'open':
        _.each(props.issues, issue => {
          if (issue.closedAt === null) {
            filteredIssues.push(issue);
          }
        });
        break;
      case 'closed':
        _.each(props.issues, issue => {
          if (issue.closedAt) {
            filteredIssues.push(issue);
          }
        });
        break;
      default:
    }

    //---- STEP 2: AGGREGATE ISSUES PER TIME INTERVAL ----
    const data = [];
    const granularity = LanguageModuleRiver.getGranularity(props.chartResolution);
    const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const sortedCloseDates = [];
    let createdDate = Date.parse(props.issues[0].createdAt);

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
    _.each(data, function(issue) {
      issueChartData.push({
        date: issue.date,
        Opened: issue.openCount,
        Closed: issue.closedCount > 0 ? issue.closedCount * -1 : -0.001
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

  extractCIData(props) {
    if (!props.builds || props.builds.length === 0) {
      return {};
    }

    //---- STEP 1: AGGREGATE BUILDS PER TIME INTERVAL ----
    const data = [];
    const granularity = LanguageModuleRiver.getGranularity(props.chartResolution);
    const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    for (let i = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj = { date: currTimestamp, succeeded: 0, failed: 0 }; //Save date of time bucket, create object
      for (; i < props.builds.length && Date.parse(props.builds[i].createdAt) < nextTimestamp; i++) {
        //Iterate through commits that fall into this time bucket
        const buildDate = Date.parse(props.builds[i].createdAt);
        if (buildDate >= currTimestamp && buildDate < nextTimestamp) {
          obj.succeeded += props.builds[i].stats.success || 0;
          obj.failed += props.builds[i].stats.failed || -0.001; //-0.001 for stack layout to realize it belongs on the bottom
        }
      }
      data.push(obj);
    }

    //--- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED BUILDS ----
    const ciChartData = [];
    const ciScale = [0, 0];
    _.each(data, function(build) {
      ciChartData.push({ date: build.date, Succeeded: build.succeeded, Failed: build.failed > 0 ? build.failed * -1 : 0 });
      if (ciScale[1] < build.succeeded) {
        ciScale[1] = build.succeeded;
      }
      if (ciScale[0] > build.failed * -1) {
        ciScale[0] = build.failed * -1;
      }
    });

    return { ciChartData, ciScale };
  }

  extractCommitData(props) {
    if (!props.commits || props.commits.length === 0) {
      return {};
    }

    //---- STEP 1: AGGREGATE COMMITS GROUPED BY AUTHORS PER TIME INTERVAL ----
    const data = [];
    //let granularity = LanguageModuleRiver.getGranularity(props.resolution);
    const granularity = LanguageModuleRiver.getGranularity(props.chartResolution);
    const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
    const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
    const next = moment(curr).add(1, props.chartResolution);
    const totalChangesPerAuthor = {};
    // TODO: remove?
    // eslint-disable-next-line no-unused-vars
    let totalChanges = 0;
    for (let i = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
      //Iterate through time buckets
      const currTimestamp = curr.toDate().getTime();
      const nextTimestamp = next.toDate().getTime();
      const obj = { date: currTimestamp, statsByAuthor: {} }; //Save date of time bucket, create object
      for (; i < props.commits.length && Date.parse(props.commits[i].date) < nextTimestamp; i++) {
        //Iterate through commits that fall into this time bucket
        const additions = props.commits[i].stats.additions;
        const deletions = props.commits[i].stats.deletions;
        const changes = additions + deletions;
        const commitAuthor = props.commits[i].signature;
        if (totalChangesPerAuthor[commitAuthor] === null) {
          totalChangesPerAuthor[commitAuthor] = 0;
        }
        totalChangesPerAuthor[commitAuthor] += changes;
        totalChanges += changes;
        if (
          commitAuthor in obj.statsByAuthor //If author is already in statsByAuthor, add to previous values
        ) {
          obj.statsByAuthor[commitAuthor] = {
            count: obj.statsByAuthor[commitAuthor].count + 1,
            additions: obj.statsByAuthor[commitAuthor].additions + additions,
            deletions: obj.statsByAuthor[commitAuthor].deletions + deletions
          };
        } else {
          //Else create new values
          obj.statsByAuthor[commitAuthor] = { count: 1, additions: additions, deletions: deletions };
        }
      }
      data.push(obj);
    }

    //---- STEP 2: CONSTRUCT CHART DATA FROM AGGREGATED COMMITS ----
    const commitChartData = [];
    const commitChartPalette = {};
    commitChartPalette['(Additions) others'] = props.palette['others'];
    commitChartPalette['(Deletions) others'] = props.palette['others'];
    _.each(data, function(commit) {
      //commit has structure {date, statsByAuthor: {}} (see next line)}
      const obj = { date: commit.date };
      obj['(Additions) others'] = 0;
      obj['(Deletions) others'] = -0.001;
      _.each(props.committers, function(committer) {
        //commitLegend to iterate over authorNames, commitLegend has structure [{name, style}, ...]
        if (committer in commit.statsByAuthor && committer in props.palette) {
          //If committer has data
          //Insert number of changes with the author name as key,
          //statsByAuthor has structure {{authorName: {count, additions, deletions, changes}}, ...}
          obj['(Additions) ' + committer] = commit.statsByAuthor[committer].additions;
          //-0.001 for stack layout to realize it belongs on the bottom
          obj['(Deletions) ' + committer] = commit.statsByAuthor[committer].deletions * -1 - 0.001;
          commitChartPalette['(Additions) ' + committer] = chroma(props.palette[committer]).alpha(0.85).hex('rgba');
          commitChartPalette['(Deletions) ' + committer] = chroma(props.palette[committer]).alpha(0.85).darken(0.5).hex('rgba');
        } else if (committer in commit.statsByAuthor && !(committer in props.palette)) {
          obj['(Additions) others'] += commit.statsByAuthor[committer].additions;
          obj['(Deletions) others'] += commit.statsByAuthor[committer].deletions * -1 - 0.001;
        } else if (committer in props.palette) {
          obj['(Additions) ' + committer] = 0;
          obj['(Deletions) ' + committer] = -0.001; //-0.001 for stack layout to realize it belongs on the bottom
        }
      });
      commitChartData.push(obj); //Add object to list of objects
    });
    //Output in commitChartData has format [{author1: 123, author2: 123, ...}, ...],
    //e.g. series names are the authors with their corresponding values

    //---- STEP 3: SCALING ----
    const commitScale = [0, 0];
    _.each(commitChartData, dataPoint => {
      let positiveTotals = 0;
      let negativeTotals = 0;
      _.each(Object.keys(dataPoint).splice(1), key => {
        if (key.includes('(Additions) ') && props.selectedAuthors.indexOf(key.split(') ')[1]) > -1) {
          positiveTotals += dataPoint[key];
        } else if (key.includes('(Deletions) ') && props.selectedAuthors.indexOf(key.split(') ')[1]) > -1) {
          negativeTotals += dataPoint[key];
        } else if (props.selectedAuthors.indexOf(key) > -1) {
          positiveTotals += dataPoint[key];
        }
      });
      if (positiveTotals > commitScale[1]) {
        commitScale[1] = positiveTotals;
      }
      if (negativeTotals < commitScale[0]) {
        commitScale[0] = negativeTotals;
      }
    });

    //---- STEP 4: FORMATTING FILTERS ----
    const selectedAuthors = [];
    const keys = Object.keys(commitChartData[0]).splice(1);

    _.each(keys, key => {
      let concatKey = key;
      if (key.includes('(Additions) ') || key.includes('(Deletions) ')) {
        concatKey = key.split(') ')[1];
      }
      if (props.selectedAuthors.indexOf(concatKey) > -1) {
        selectedAuthors.push(key);
      }
    });

    return { commitChartData, commitScale, commitPalette: commitChartPalette, selectedAuthors };
  }

  static getGranularity(resolution) {
    switch (resolution) {
      case 'years':
        return { interval: moment.duration(1, 'year'), unit: 'year' };
      case 'months':
        return { interval: moment.duration(1, 'month'), unit: 'month' };
      case 'weeks':
        return { interval: moment.duration(1, 'week'), unit: 'week' };
      case 'days':
        return { interval: moment.duration(1, 'day'), unit: 'day' };
      default:
        return { interval: 0, unit: '' };
    }
  }
}
