'use-strict';

import { useSelector } from 'react-redux';
import StackedAreaChart from '../../../components/StackedAreaChart';
import styles from '../styles.module.scss';
import * as d3 from 'd3';
import { useState, useEffect } from 'react';
import _ from 'lodash';

export default () => {
  //local state used for the chart
  const [ownershipData, setOwnershipData] = useState([]);
  const [keys, setKeys] = useState([]);
  const [scale, setScale] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartComponent, setChartComponent] = useState(null);

  //global state
  const ownershipState = useSelector((state) => state.visualizations.codeOwnership.state);
  const isLoading = ownershipState.data.isFetching;
  const relevantOwnershipData = ownershipState.data.data.rawData;
  const previousFilenames = ownershipState.data.data.previousFilenames;
  const displayMode = ownershipState.config.mode;
  const currentBranch = ownershipState.config.currentBranch;
  const activeFiles = ownershipState.config.activeFiles;

  const universalSettings = useSelector((state) => state.universalSettings);
  const selectedAuthors = universalSettings.selectedAuthorsGlobal;
  const otherAuthors = universalSettings.otherAuthors;
  const mergedAuthors = universalSettings.mergedAuthors;
  const dataGranularity = universalSettings.chartResolution;
  const authorColors = universalSettings.universalSettingsData.data.palette;
  const dateFrom = universalSettings.chartTimeSpan.from;
  const dateUntil = universalSettings.chartTimeSpan.to;

  const resetData = () => {
    setKeys([]);
    setChartData([]);
    setScale([]);
  };

  //when a new branch is selected, new data is fetched. When the data is ready, prepare it for further processing.
  useEffect(() => {
    if (relevantOwnershipData === undefined || relevantOwnershipData === null || activeFiles === undefined || activeFiles === null) {
      return;
    }

    let resultOwnershipData = [];

    //stores the current ownership distribution for each file
    const fileCache = {};

    //step through the commits sequentially, starting with the oldest one
    for (const commit of relevantOwnershipData) {
      const commitResult = { sha: commit.sha, date: commit.date, ownership: {} };

      //update fileCache for each file this commit touches
      for (const file of commit.files) {
        //if the file was deleted in this commit, delete it from the filecache
        if (file.action === 'deleted') {
          delete fileCache[file.path];
        } else {
          //if the file was either added or modified, we add it to the filecache (if it is relevant)
          //the file is relevant if it is either one of the currently active files
          // or if it is a previous version of an active file.
          let relevant = activeFiles.includes(file.path);

          if (!relevant) {
            //look at the previous filenames of all active files
            for (const [fileName, previousNames] of Object.entries(previousFilenames)) {
              if (!activeFiles.includes(fileName)) continue;
              if (relevant) break;
              //for all previous filenames of the file we are currently looking at
              for (const name of previousNames) {
                //if this old filename is the one the current commit touches
                // (same path and committed at a time where the file had that path),
                // this file is relevant
                if (
                  name.oldFilePath === file.path &&
                  new Date(name.hasThisNameFrom) <= new Date(commit.date) &&
                  new Date(commit.date) <= new Date(name.hasThisNameUntil)
                ) {
                  relevant = true;
                  break;
                }
              }
            }
          }

          if (relevant) {
            fileCache[file.path] = file.ownership;
          }
        }
      }

      //now filecache stores the current ownership for each file that exists at the time of the current commit
      for (const [, fileOwnershipData] of Object.entries(fileCache)) {
        for (const ownershipOfStakeholder of fileOwnershipData) {
          if (commitResult.ownership[ownershipOfStakeholder.stakeholder]) {
            commitResult.ownership[ownershipOfStakeholder.stakeholder] += ownershipOfStakeholder.ownedLines;
          } else {
            commitResult.ownership[ownershipOfStakeholder.stakeholder] = ownershipOfStakeholder.ownedLines;
          }
        }
      }
      resultOwnershipData.push(commitResult);
    }
    setOwnershipData(resultOwnershipData);
  }, [relevantOwnershipData, previousFilenames, activeFiles]);

  //everytime the settings change (different files selected, mode changed etc.) recompute the chart data
  useEffect(() => {
    //if the global state has not loaded yet, return
    if (ownershipData === undefined || ownershipData === null) {
      return;
    }

    if (ownershipData.length === 0) {
      resetData();
    }

    //filter ownership data for commits that are in the right timespan
    const filteredOwnershipData = ownershipData.filter((o) => {
      const date = new Date(o.date);
      const minDate = dateFrom ? new Date(dateFrom) : new Date(0);
      const maxDate = dateUntil ? new Date(dateUntil) : new Date();
      return minDate <= date && date <= maxDate;
    });

    //compute scale
    // in relative mode, the scale is always min=0, max=1.
    // in absolute mode, the max value has to be computed
    if (displayMode === 'relative') {
      setScale([0, 1]);
    } else {
      let max = 0;
      for (const commit of filteredOwnershipData) {
        let tmp = 0;
        for (const [, ownership] of Object.entries(commit.ownership)) {
          tmp += ownership;
        }
        if (tmp > max) {
          max = tmp;
        }
      }
      setScale([0, max * 1.1]);
    }

    //get all stakeholders
    let tempKeys = [];
    filteredOwnershipData.map((d) => {
      for (const [authorName] of Object.entries(d.ownership)) {
        //only display authors that are selected in the universal settings
        if (!tempKeys.includes(authorName) && selectedAuthors.includes(authorName)) {
          tempKeys.push(authorName);
        }
      }
    });

    if (selectedAuthors.includes('others')) {
      tempKeys.push('other');
    }

    setKeys(tempKeys);

    let result = filteredOwnershipData.map((d) => {
      let result = {};
      //set the date as timestamp (in ms)
      result.date = new Date(d.date).getTime();

      //set the ownership to 0 for all stakeholders
      for (const name of tempKeys) {
        result[name] = 0;
      }

      //also for special stakeholder "other"
      result['other'] = 0;

      //set the ownership of everyone to the real value
      for (const [authorName, ownership] of Object.entries(d.ownership)) {
        //if the author is in the "other" category, add the ownership to the "other" author
        if (otherAuthors.map((oa) => oa.signature).includes(authorName)) {
          result['other'] += ownership;
        }

        //check if the author is part of a merges author from the universal settings
        for (const mergedAuthor of mergedAuthors) {
          if (mergedAuthor.committers.map((c) => c.signature).includes(authorName)) {
            result[mergedAuthor.mainCommitter] += ownership;
            break;
          }
        }
      }
      return result;
    });

    if (dataGranularity === 'days') {
      setChartData(result);
    } else {
      let groupedResult;

      if (dataGranularity === 'years') {
        groupedResult = _.groupBy(result, (dataPoint) => '' + new Date(dataPoint.date).getFullYear());
      } else if (dataGranularity === 'months') {
        groupedResult = _.groupBy(
          result,
          (dataPoint) => '' + new Date(dataPoint.date).getMonth() + '-' + new Date(dataPoint.date).getFullYear()
        );
      } else if (dataGranularity === 'weeks') {
        groupedResult = _.groupBy(result, (dataPoint) => {
          let d = new Date(dataPoint.date);
          let onejan = new Date(d.getFullYear(), 0, 1);
          let week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
          return '' + week + '-' + d.getFullYear();
        });
      } else {
        //invalid granularity
        console.log('Error in Code Ownership: granularity "' + dataGranularity + '" not valid');
        setChartData(result);
        return;
      }

      const coarseResult = [];

      const firstDataPoint = result.sort((a, b) => a.date - b.date)[0];
      if (firstDataPoint) {
        coarseResult.push(firstDataPoint);
      }

      for (const [, points] of Object.entries(groupedResult)) {
        let dataPoints = points.sort((a, b) => a.date - b.date);
        //only consider last element
        coarseResult.push(dataPoints.slice(-1)[0]);
      }

      setChartData(coarseResult);
    }
  }, [ownershipData, displayMode, universalSettings]);

  //check if the data needed for the chart has all been set
  useEffect(() => {
    if (chartData && chartData.length !== 0 && scale && scale.length !== 0 && keys && keys.length !== 0) {
      setChartComponent(
        <StackedAreaChart
          content={chartData}
          palette={authorColors}
          paddings={{ top: 20, left: 70, bottom: 40, right: 30 }}
          yDims={scale}
          d3offset={displayMode === 'relative' ? d3.stackOffsetExpand : d3.stackOffsetNone}
          resolution={dataGranularity}
          keys={keys}
          order={keys.reverse()}
        />
      );
    } else {
      setChartComponent(null);
    }
  }, [chartData, scale, keys, authorColors]);

  const FullScreenMessage = ({ message }) => {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <div className={styles.messageContainer}>
            <h1>{message}</h1>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <FullScreenMessage message={'Loading...'} />;
  }

  if (currentBranch === undefined || currentBranch === null) {
    return <FullScreenMessage message={'Select a branch'} />;
  }

  if (activeFiles && activeFiles.length === 0) {
    return <FullScreenMessage message={'Select Files/Modules to be visualized'} />;
  }

  if (chartData === undefined || chartData === null || chartData.length === 0) {
    return <FullScreenMessage message={'Loading...'} />;
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chart}>{chartComponent}</div>
    </div>
  );
};
