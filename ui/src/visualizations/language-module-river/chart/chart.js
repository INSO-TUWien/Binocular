'use strict';

import React from 'react';

import styles from '../styles.scss';
import _ from 'lodash';

import moment from 'moment';
import chroma from 'chroma-js';
import { DataRiverChartComponent } from '../../../components/DataRiverChart/data-river-chart.component';
import cx from 'classnames';
import { BuildStat, RiverData } from '../../../components/DataRiverChart/RiverData';
import StreamKey from '../../../components/DataRiverChart/StreamKey';
import IssueStream, { IssueStat } from '../../../components/DataRiverChart/IssueStream';
import { InvalidArgumentException } from '../../../utils/exception/InvalidArgumentException';
import { getGranularityDuration } from '../../../utils/date';

export default class LanguageModuleRiver extends React.Component {
  constructor(props) {
    super(props);

    const { riverData } = this.extractRiverData(props);
    //const { issueChartData } = this.extractIssueData(props);

    this.state = {
      commitChartData: riverData, //Data for commit changes
      issueChartData: [],
      commitPalette: {},
      selectedAuthors: props.selectedAuthors,
      selectedLanguages: props.selectedLanguages,
      selectedModules: props.selectedModules
    };
  }

  /**
   * Update computed commit data
   * @param nextProps props that are passed
   */
  componentWillReceiveProps(nextProps) {
    const { riverData } = this.extractRiverData(nextProps);

    this.setState(prev =>
      Object.assign(prev, {
        commitChartData: riverData,
        issueChartData: [],
        commitPalette: {},
        selectedAuthors: nextProps.selectedAuthors,
        selectedLanguages: nextProps.selectedLanguages,
        selectedModules: nextProps.selectedModules
      })
    );
  }

  render() {
    const attributes = this.props.attributes;

    let commitOrder;
    if (attributes && this.props.chartAttribute && attributes.authors && attributes[this.props.chartAttribute]) {
      commitOrder = _.flatMap(
        attributes.authors.order.map(author =>
          attributes[this.props.chartAttribute].order.map(
            attribute => new StreamKey({ name: author.name, attribute: attribute.name, changes: author.changes + attribute.changes })
          )
        )
      ).sort((order1, order2) => order2.data.changes - order1.data.changes);
    }
    const { authorPalette, attributePalette } = this.createStreamColorPalette(attributes);

    const issuePalette = {
      [IssueStat.Open.name]: chroma('skyblue').hex(),
      [IssueStat.InProgress.name]: '#ffe12e',
      [IssueStat.Close.name]: '#63c56c'
    };

    const issueStream = this.props.highlightedIssue
      ? new IssueStream(this.props.highlightedIssue.iid, this.props.highlightedIssue.webUrl)
          .setStart(Date.parse(this.props.highlightedIssue.createdAt))
          .pushCommits(this.props.highlightedCommits)
      : undefined;

    if (issueStream && this.props.highlightedIssue.closedAt) {
      issueStream.setEnd(Date.parse(this.props.highlightedIssue.closedAt));
    }

    const attribute = this.props.chartAttribute || '';

    const commitChart = (
      <div className={styles.chartLine}>
        <div className={cx(styles.text, 'label')}>
          {attribute} River
        </div>
        <div className={styles.chart}>
          <DataRiverChartComponent
            sidebarOpen={this.props.sidebarOpen}
            content={this.state.commitChartData}
            authorPalette={authorPalette}
            attributePalette={attributePalette}
            issuePalette={issuePalette}
            paddings={{ top: 40, left: 60, bottom: 40, right: 70 }}
            xAxisCenter={true}
            resolution={this.props.chartResolution}
            displayNegative={true}
            order={commitOrder}
            attribute={attribute}
            issueStreams={issueStream ? [issueStream] : []}
          />
        </div>
      </div>
    );

    const loadingHint = (
      <div className={styles.loadingHintContainer}>
        <h1 className={styles.loadingHint}>
          Loading... <i className="fas fa-spinner fa-pulse" />
        </h1>
      </div>
    );

    return (
      <div className={styles.chartContainer}>
        {!this.state.commitChartData && loadingHint}
        {this.state.commitChartData && commitChart}
      </div>
    );
  }

  /**
   * create all required stream palettes to visualize the give attributes and each available author
   *
   * @param attributes contains the property attributes that holds the color specific information referring to each attribute and author
   * @returns {{authorPalette: T, attributePalette: T}}
   */
  createStreamColorPalette(attributes) {
    const authorPalette = (this.state.selectedAuthors || []).reduce((authors, authorName) => {
      const author = attributes && attributes.authors ? attributes.authors.colors.find(color => color.key === authorName) : undefined;
      if (author) {
        authors[`(Additions) ${author.key}`] = author.color;
        authors[`(Deletions) ${author.key}`] = chroma(author.color).darken(1).css();
      }
      return authors;
    }, {});

    const selectedAttribute =
      this.props.chartAttribute === 'languages'
        ? this.props.selectedLanguages
        : this.props.chartAttribute === 'modules' ? this.props.selectedModules : undefined;

    const attributePalette = (selectedAttribute || []).reduce((attributePalette, attributeName) => {
      const attribute =
        attributes && attributes[this.props.chartAttribute]
          ? attributes[this.props.chartAttribute].colors.find(color => color.key === attributeName)
          : undefined;
      if (attribute) {
        attributePalette[`${attribute.key}`] = attribute.color;
      }
      return attributePalette;
    }, {});
    return { authorPalette, attributePalette };
  }

  /**
   * filter, organize and create river data referring to the given attribute and associated with the provided data
   *
   * @param props contains the latest chart properties to create the corresponding riverData streams
   * @returns {{riverData: RiverData[]}}
   */
  extractRiverData(props) {
    if (!props || !props.commits || props.commits.length === 0 || !props.chartAttribute) {
      return [];
    }

    const getOthers = key =>
      props.attributes && props.attributes[key] && props.attributes[key].others ? props.attributes[key].others : [];
    const attr = {
      authors: getOthers('authors'),
      [props.chartAttribute]: getOthers(props.chartAttribute)
    };

    const attributeStreams = {
      commits:
        props.chartAttribute === 'languages'
          ? this.extractCommitAttribute(
              props.commits,
              commit => commit.languages,
              commit => commit.language.name,
              attr.authors,
              attr.languages
            )
          : props.chartAttribute === 'modules'
            ? this.extractCommitAttribute(props.commits, commit => commit.modules, commit => commit.module.path, attr.authors, attr.modules)
            : undefined,
      selectedAttributes:
        props.chartAttribute === 'languages'
          ? props.selectedLanguages
          : props.chartAttribute === 'modules' ? props.selectedModules : undefined
    };

    if (!attributeStreams.commits || !attributeStreams.selectedAttributes) {
      throw new InvalidArgumentException(`The provided data river attribute '${props.chartAttribute}' is unknown!`);
    }

    const commits = attributeStreams.commits.filter(
      stream =>
        stream &&
        stream.length &&
        stream[0] &&
        props.selectedAuthors.find(author => author === stream[0].signature) &&
        attributeStreams.selectedAttributes.find(attribute => attribute === stream[0].attribute)
    );

    const granularity = getGranularityDuration(props.chartResolution);
    const riverData = this.createAggregatedRiverData(commits, props, granularity);

    return { riverData };
  }

  /**
   * creates a list of all aggregated commits referring to the given commit stream and timespan
   *
   * @param commits contains the pre-organized commit stream grouped by the signature and attribute
   * @param props holds the chart properties to gather specific information
   * @param granularity defines the timespan granularity
   * @returns [RiverData] get a list of all aggregated commits
   */
  createAggregatedRiverData(commits, props, granularity) {
    const jobs = _.flatMap(props.builds, build => build.jobs.map(job => Object.assign(job, { sha: build.sha })));
    const groupedBuilds = _.groupBy(jobs, 'sha');

    // aggregate all commits referring to a given commit stream and the corresponding timespan aggregation
    // and flat the data streams to one stream
    return _.flatMap(
      commits.map(commitStream => {
        const aggregatedCommits = [];

        if (!commitStream || !commitStream.length) {
          return aggregatedCommits;
        }

        const curr = moment(props.firstSignificantTimestamp).startOf(granularity.unit).subtract(1, props.chartResolution);
        const end = moment(props.lastSignificantTimestamp).endOf(granularity.unit).add(1, props.chartResolution);
        const next = moment(curr).add(1, props.chartResolution);

        // aggregate commits of a stream between a given timespan
        for (let i = 0; curr.isSameOrBefore(end); curr.add(1, props.chartResolution), next.add(1, props.chartResolution)) {
          const nextTimestamp = next.toDate().getTime();
          const aggregatedPerDate = {
            date: curr.toDate(),
            name: commitStream[0].signature,
            shas: [],
            attribute: commitStream[0].attribute,
            additions: 0,
            deletions: 0
          };

          // aggregate commit stream stats
          for (; i < commitStream.length && Date.parse(commitStream[i].date) < nextTimestamp; i++) {
            aggregatedPerDate.additions += commitStream[i].stats.additions;
            aggregatedPerDate.deletions += commitStream[i].stats.deletions;
            aggregatedPerDate.shas.push(commitStream[i].sha);
          }

          this.setCalculatedBuildRate(aggregatedPerDate, groupedBuilds);

          // add build if the aggregated data point holds any data
          if (aggregatedPerDate.shas.length) {
            aggregatedCommits.push(new RiverData({ data: aggregatedPerDate }));
          }
        }
        return aggregatedCommits;
      })
    );
  }

  /**
   * calculates the build rate referring to all builds that are associated with the aggregated shas and add its result
   *
   * @param aggregatedPerDate contains the required shas and receives the build results as new properties
   * @param groupedBuilds contains all available builds
   */
  setCalculatedBuildRate(aggregatedPerDate, groupedBuilds) {
    // group all builds that matches the stored shas
    const aggregatedBuilds = _.groupBy(
      aggregatedPerDate.shas.reduce((builds, sha) => {
        if (!groupedBuilds[sha]) {
          return builds;
        }
        return builds.concat(groupedBuilds[sha].map(build => build.status));
      }, [])
    );

    const status = Object.keys(aggregatedBuilds).sort((a, b) => aggregatedBuilds[b].length - aggregatedBuilds[a].length);
    const total = status.reduce((sum, key) => sum + aggregatedBuilds[key].length, 0);
    aggregatedPerDate.buildStat = BuildStat.valueOf(status[0]);
    aggregatedPerDate.buildWeight = total ? aggregatedBuilds[status[0]].length / total : 0;
  }

  /**
   * extract and reorganize all contributor and attribute specific data and organize them in separate streams
   *
   * @param commits
   * @param commitFn
   * @param attributeFn
   * @param others
   * @param othersAttribute
   * @returns {unknown[]}
   */
  extractCommitAttribute(commits, commitFn, attributeFn, others = [], othersAttribute = []) {
    const attributes = _.flatMap(commits, commit =>
      commitFn(commit).data.map(data => {
        const attribute = attributeFn(data);
        return Object.assign(
          {
            sha: commit.sha,
            date: commit.date,
            messageHeader: commit.messageHeader,
            signature: others.find(name => name === commit.signature) ? 'others' : commit.signature
          },
          data,
          {
            attribute: othersAttribute.find(name => name === attribute) ? 'others' : attribute
          }
        );
      })
    );

    const grouped = _.groupBy(attributes, 'signature');
    return _.flatMap(
      Object.keys(grouped).map(key => {
        const organized = _.groupBy(grouped[key], 'attribute');
        return Object.keys(organized).map(organizedKey => organized[organizedKey]);
      })
    );
  }

  /**
   *
   * @param props
   * @returns {{}|{issueChartData: [], issueScale: number[]}}
   */
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
    const granularity = getGranularityDuration(props.chartResolution);
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
}
