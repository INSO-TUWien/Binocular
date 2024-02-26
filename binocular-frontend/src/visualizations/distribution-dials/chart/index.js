'use-strict';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles.module.scss';
import _ from 'lodash';
import Chart from './chart';

export default () => {
  //local state
  const [chartData, setChartData] = useState(null);

  //global state
  const distributionDialsState = useSelector((state) => state.visualizations.distributionDials.state);
  const rawData = distributionDialsState.data.data.rawData;
  const isFetching = distributionDialsState.data.isFetching;
  const filterCommitsChanges = distributionDialsState.config.filterCommitsChanges;
  const filterCommitsChangesCutoff = distributionDialsState.config.filterCommitsChangesCutoff;

  const universalSettings = useSelector((state) => state.universalSettings);
  const selectedAuthors = universalSettings.selectedAuthorsGlobal;
  const otherAuthors = universalSettings.otherAuthors;
  const mergedAuthors = universalSettings.mergedAuthors;
  const dataGranularity = universalSettings.chartResolution;
  const authorColors = universalSettings.universalSettingsData.data.palette;
  const dateFrom = universalSettings.chartTimeSpan.from;
  const dateUntil = universalSettings.chartTimeSpan.to;
  const excludeMergeCommits = universalSettings.excludeMergeCommits;
  const excludedCommits = universalSettings.excludedCommits;
  const excludeCommits = universalSettings.excludeCommits;

  useEffect(() => {
    if (!rawData) {
      return;
    }

    //find out which of the merged authors are also selected at the moment
    const selectedMergedAuthors = mergedAuthors.filter((m) => selectedAuthors.includes(m.mainCommitter));
    //if the 'others' cetegory is also selected, add it to the array
    if (selectedAuthors.includes('others')) {
      selectedMergedAuthors.push({
        mainCommitter: 'other',
        committers: otherAuthors,
        color: authorColors['other'],
      });
    }

    // ############ STEP 1: Filter issues, filter commits and add builds ############

    const filteredCreatedIssues = rawData.issues.filter((i) => {
      const date = new Date(i['createdAt']);
      const minDate = dateFrom ? new Date(dateFrom) : new Date(0);
      const maxDate = dateUntil ? new Date(dateUntil) : new Date();
      return minDate <= date && date <= maxDate;
    });

    const filteredClosedIssues = rawData.issues.filter((i) => {
      const date = new Date(i['closedAt']);
      const minDate = dateFrom ? new Date(dateFrom) : new Date(0);
      const maxDate = dateUntil ? new Date(dateUntil) : new Date();
      return minDate <= date && date <= maxDate;
    });

    //exclude merge commits if option is set in universal settings
    let filteredCommits = rawData.commits;
    if (excludeMergeCommits) {
      filteredCommits = filteredCommits.filter((c) => c.parents && c.parents.length < 2);
    }
    // filter explicitly excluded commits
    if (excludeCommits) {
      filteredCommits = filteredCommits.filter((c) => !excludedCommits.includes(c.sha));
    }

    //exclude commits with a certain number of changes if option is set in config component
    if (filterCommitsChanges) {
      filteredCommits = filteredCommits.filter((c) => c.stats.additions + c.stats.deletions < filterCommitsChangesCutoff);
    }
    // we don't need commits from authors that are not checked or which are not in the specified timespan
    filteredCommits = filteredCommits
      .map((c) => {
        const date = new Date(c.date);
        const minDate = dateFrom ? new Date(dateFrom) : new Date(0);
        const maxDate = dateUntil ? new Date(dateUntil) : new Date();
        const mainSignature = getMainSignature(c.signature, selectedMergedAuthors);
        //check if the date fits and the main committer is selected
        if (minDate > date || date > maxDate || !mainSignature) {
          return null;
        }

        //find builds
        //if there is at least one successful build, this commit is considered successful
        // otherwise: if there is a failed build, it is considered failed
        // otherwise: this commit is considered neutral
        let status = null;
        const relevantBuilds = rawData.builds.filter((b) => b.commit && b.commit.sha === c.sha);
        if (relevantBuilds.length !== 0) {
          const success = relevantBuilds.filter((b) => b.status === 'success');
          const failed = relevantBuilds.filter((b) => b.status === 'failed');
          if (success.length !== 0) {
            status = 'success';
          } else if (failed.length !== 0) {
            status = 'failed';
          }
        }
        return {
          signature: mainSignature,
          date: c.date,
          stats: c.stats,
          buildStatus: status,
        };
      })
      .filter((c) => c !== null);

    // ############ STEP 2: distribute commits and issues in appropriate buckets ############

    const buckets = [];

    if (dataGranularity === 'days') {
      //24 buckets (00:00-00:59, 01:00-01:59, ..., 23:00-23:59)
      initializeBuckets(buckets, 24, (num) => '' + num);
      distributeToBuckets(buckets, 'commits', filteredCommits, 'date', (date) => new Date(date).getHours());
      distributeToBuckets(buckets, 'issuesCreated', filteredCreatedIssues, 'createdAt', (date) => new Date(date).getHours());
      distributeToBuckets(buckets, 'issuesClosed', filteredClosedIssues, 'createdAt', (date) => new Date(date).getHours());
    } else if (dataGranularity === 'weeks') {
      //7 buckets (monday - sunday)
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      initializeBuckets(buckets, 7, (num) => weekdays[num]);
      distributeToBuckets(buckets, 'commits', filteredCommits, 'date', (date) => new Date(date).getDay());
      distributeToBuckets(buckets, 'issuesCreated', filteredCreatedIssues, 'createdAt', (date) => new Date(date).getDay());
      distributeToBuckets(buckets, 'issuesClosed', filteredClosedIssues, 'createdAt', (date) => new Date(date).getDay());
    } else if (dataGranularity === 'months') {
      //31 buckets (one for every day of the month)
      initializeBuckets(buckets, 31, (num) => '' + (num + 1));
      distributeToBuckets(buckets, 'commits', filteredCommits, 'date', (date) => new Date(date).getDate() - 1);
      distributeToBuckets(buckets, 'issuesCreated', filteredCreatedIssues, 'createdAt', (date) => new Date(date).getDate() - 1);
      distributeToBuckets(buckets, 'issuesClosed', filteredClosedIssues, 'createdAt', (date) => new Date(date).getDate() - 1);
    } else if (dataGranularity === 'years') {
      //12 buckets (January - December)
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      initializeBuckets(buckets, 12, (num) => months[num]);
      distributeToBuckets(buckets, 'commits', filteredCommits, 'date', (date) => new Date(date).getMonth());
      distributeToBuckets(buckets, 'issuesCreated', filteredCreatedIssues, 'createdAt', (date) => new Date(date).getMonth());
      distributeToBuckets(buckets, 'issuesClosed', filteredClosedIssues, 'createdAt', (date) => new Date(date).getMonth());
    }

    setChartData(buckets);
  }, [rawData, universalSettings, filterCommitsChanges, filterCommitsChangesCutoff, excludedCommits, excludeCommits, excludeMergeCommits]);

  if (isFetching || chartData === null) {
    return (
      <div className={styles.chartDialsContainer}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className={styles.chartDialsContainer}>
      <Chart data={chartData} />
    </div>
  );
};

// Helper Functions

const getMainSignature = (signature, mergedAuthors) => {
  for (const mainAuthor of mergedAuthors) {
    for (const author of mainAuthor.committers) {
      if (signature === author.signature) {
        return mainAuthor.mainCommitter;
      }
    }
  }
  return null;
};

const initializeBuckets = (buckets, numberOfBuckets, labelFun) => {
  for (let i = 0; i < numberOfBuckets; i++) {
    buckets.push({
      label: labelFun(i),
      commits: [],
      issuesCreated: [],
      issuesClosed: [],
    });
  }
};

const distributeToBuckets = (buckets, target, data, dateField, getBucket) => {
  data.map((d) => {
    const date = d[dateField];
    const bucket = getBucket(date);
    buckets[bucket][target].push(d);
  });
};
