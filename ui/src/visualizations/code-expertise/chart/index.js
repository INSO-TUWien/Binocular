import Chart from './chart';
import Details from './details';
import styles from '../styles.scss';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FullScreenMessage from './full-screen-message.js';
import _ from 'lodash';

export default () => {
  const universalSettings = useSelector((state) => state.universalSettings);
  const selectedAuthors = universalSettings.selectedAuthorsGlobal;
  const otherAuthors = universalSettings.otherAuthors;
  const mergedAuthors = universalSettings.mergedAuthors;
  // const dataGranularity = universalSettings.chartResolution;
  // const authorColors = universalSettings.universalSettingsData.data.palette;
  // const dateFrom = universalSettings.chartTimeSpan.from;
  // const dateUntil = universalSettings.chartTimeSpan.to;

  const data = useSelector((state) => state.visualizations.codeExpertise.state.data.data);
  const config = useSelector((state) => state.visualizations.codeExpertise.state.config);
  const isFetching = useSelector((state) => state.visualizations.codeExpertise.state.data.isFetching);
  const mode = useSelector((state) => state.visualizations.codeExpertise.state.config.mode);

  //filtered data for each developer
  const [devData, setDevData] = useState({});

  //calculate the data for relevant (selected) developers
  useEffect(() => {
    //first find out which authors are relevant using the universal data
    let authors = selectedAuthors.map((a) => (a === 'others' ? 'other' : a));

    //only consider dev data of selected authors
    let relevantDevData = {};

    //for every author from the universal settings
    for (const author of mergedAuthors) {
      //if this author is selected
      if (authors.includes(author.mainCommitter)) {
        //create new object for main committer
        if (!relevantDevData[author.mainCommitter]) {
          relevantDevData[author.mainCommitter] = {
            linesOwned: 0,
            additions: 0,
            commits: [],
          };
        }

        //merge the data from the authors aliases
        for (const alias of author.committers.map((c) => c.signature)) {
          if (data.devData[alias]) {
            relevantDevData[author.mainCommitter].additions += data.devData[alias].additions;
            relevantDevData[author.mainCommitter].linesOwned += data.devData[alias].linesOwned;
            relevantDevData[author.mainCommitter].commits = _.uniq(
              relevantDevData[author.mainCommitter].commits.concat(data.devData[alias].commits)
            );
          }
        }
      }
    }

    //if there are authors in the 'other' category, combine their data
    if (authors.includes('other')) {
      //get other authors
      const signatures = otherAuthors.map((a) => a.signature);
      let otherResult = { linesOwned: 0, additions: 0, commits: [] };
      Object.entries(data.devData).map((item, index) => {
        const name = item[0];
        const data = item[1];
        if (signatures.includes(name)) {
          otherResult.additions += data.additions;
          otherResult.linesOwned += data.linesOwned;
          otherResult.commits = _.uniq(otherResult.commits.concat(data.commits));
        }
      });
      relevantDevData['other'] = otherResult;
    }

    setDevData(relevantDevData);
  }, [universalSettings, data]);

  //print messages when use has to take action

  if (config.currentBranch === null) {
    return (
      <div className={styles.chartDetailsContainer}>
        <FullScreenMessage message={'Please select a Branch!'} />
      </div>
    );
  }

  if (config.mode === 'issues' && config.activeIssueId === null) {
    return (
      <div className={styles.chartDetailsContainer}>
        <FullScreenMessage message={'Please select an Issue to be visualized!'} />
      </div>
    );
  }

  if (config.mode === 'modules' && (config.activeFiles === null || config.activeFiles.length === 0)) {
    return (
      <div className={styles.chartDetailsContainer}>
        <FullScreenMessage message={'Please select a File to be visualized!'} />
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className={styles.chartDetailsContainer}>
        <FullScreenMessage message={'Loading...'} />
      </div>
    );
  }

  return (
    <div className={styles.chartDetailsContainer}>
      <Chart devData={devData} />
      <Details devData={devData} />
    </div>
  );
};
