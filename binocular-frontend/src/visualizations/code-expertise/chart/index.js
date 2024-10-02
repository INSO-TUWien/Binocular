import Chart from './chart';
import Details from './details';
import styles from '../styles.module.scss';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullScreenMessage from './full-screen-message';
import _ from 'lodash';
import {
  addBuildData,
  extractRelevantPreviousFilenames,
  getBlameModules,
  getCommitHashesForFiles,
  getCommitsForBranch,
} from '../sagas/helper';
import { requestRefresh } from '../sagas';

export default () => {
  const universalSettings = useSelector((state) => state.universalSettings);
  const selectedAuthors = universalSettings.selectedAuthorsGlobal;
  const otherAuthors = universalSettings.otherAuthors;
  const mergedAuthors = universalSettings.mergedAuthors;
  const excludedCommits = universalSettings.excludedCommits;
  const excludeCommits = universalSettings.excludeCommits;
  const filterMergeCommits = universalSettings.excludeMergeCommits;

  const rawData = useSelector((state) => state.visualizations.codeExpertise.state.data.data);
  const config = useSelector((state) => state.visualizations.codeExpertise.state.config);
  const isFetching = useSelector((state) => state.visualizations.codeExpertise.state.data.isFetching);
  const mode = useSelector((state) => state.visualizations.codeExpertise.state.config.mode);
  const activeFiles = useSelector((state) => state.visualizations.codeExpertise.state.config.activeFiles);

  //processed data
  const [data, setData] = useState(null);
  //filtered data for each developer
  const [devData, setDevData] = useState({});

  const dispatch = useDispatch();

  //process raw data from global store
  useEffect(() => {
    const result = {
      devData: {},
      issue: null,
    };

    if (rawData === null || rawData === undefined) {
      setData(result);
      return;
    }

    if (mode === 'issues' && rawData.issue === null) {
      setData(result);
      return;
    }

    if (!rawData.branchCommits) {
      dispatch(requestRefresh());
      return;
    }

    const branchCommits = rawData.branchCommits;
    const builds = rawData.builds;
    const issueData = rawData.issue;
    const allPrevFilenames = rawData.prevFilenames;
    const prevFilenames = extractRelevantPreviousFilenames(activeFiles, allPrevFilenames);

    let relevantCommitHashes;

    if (mode === 'modules') {
      relevantCommitHashes = getCommitHashesForFiles(branchCommits, activeFiles, prevFilenames);
    } else {
      relevantCommitHashes = issueData.issueCommits;
    }

    //########### get all relevant commits ###########

    //we now have all commits for the current branch and all commits for the issue
    //intersect the two groups to get the result set
    //we are interested in commits that are both on the current branch and related to the issue
    let relevantCommits = branchCommits.filter((commit) => {
      //if a commits parent string contains a comma, it has more than one parent -> it is a merge commit
      if (filterMergeCommits && commit.parents.length > 1) {
        return false;
      }

      if (excludeCommits && excludedCommits.includes(commit.sha)) {
        return false;
      }

      return relevantCommitHashes.includes(commit.sha);
    });

    if (relevantCommits.length === 0) {
      setData(result);
      return;
    }

    //########### add build data to commits ###########
    relevantCommits = addBuildData(relevantCommits, builds);

    //########### extract data for each user ###########

    //first group all relevant commits by user
    const commitsByUsers = _.groupBy(relevantCommits, (commit) => commit.signature);

    for (const user in commitsByUsers) {
      result['devData'][user] = {};

      //add commits to each user
      result['devData'][user]['commits'] = commitsByUsers[user];

      //initialize linesOwned with 0. If program runs in online mode, this will be updated later
      result['devData'][user]['linesOwned'] = 0;

      //for each user, sum up relevant additions
      result['devData'][user]['additions'] = _.reduce(
        commitsByUsers[user],
        (sum, commit) => {
          if (mode === 'issues') {
            //we are interested in all additions made in each commit
            return sum + commit.stats.additions;
          } else {
            let tempsum = 0;
            //we are interested in the additions made to the currently active files
            //TODO what if the commit touches an old file that has the same name as a current file?
            const relevantActiveFiles = commit.files.data.filter((f) => activeFiles.includes(f.file.path));
            //if at least one exists, return the respective additions
            if (relevantActiveFiles && relevantActiveFiles.length > 0) {
              tempsum += _.reduce(relevantActiveFiles, (fileSum, file) => fileSum + file.stats.additions, 0);
            }

            //also, we want to check if this commit touches previous versions of the active files
            //for each file this commit touches
            commit.files.data.map((f) => {
              const filePath = f.file.path;
              const commitDate = new Date(commit.date);

              //get all objects for previous file names that have the same name as the file we are currently looking at
              //this means that maybe this commit touches a file that was renamed later on
              const prevFileObjects = prevFilenames.filter((pfno) => pfno.oldFilePath === filePath);
              //for each of these file objects (there could be multiple since the file may have been renamed multiple times)
              for (const prevFileObj of prevFileObjects) {
                //if hasThisNameUntil is null, this means that this is the current name of the file.
                // since we are at this point only interested in previous files, we ignore this file
                if (prevFileObj.hasThisNameUntil === null) continue;

                const fileWasNamedFrom = new Date(prevFileObj.hasThisNameFrom);
                const fileWasNamedUntil = new Date(prevFileObj.hasThisNameUntil);
                //if this commit touches a previous version of this file in the right timeframe,
                // we add the additions of this file to the temporary sum
                if (fileWasNamedFrom <= commitDate && commitDate < fileWasNamedUntil) {
                  tempsum += f.stats.additions;
                }
              }
            });

            return sum + tempsum;
          }
        },
        0,
      );
    }

    //########### add ownership data to commits ###########

    // don't add ownership when in issues mode
    if (mode === 'issues') {
      setData(result);
      return;
    }

    const latestBranchCommit = branchCommits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const blameRes = getBlameModules(latestBranchCommit, activeFiles, branchCommits, excludeCommits ? excludedCommits : []);
    for (const [name, val] of Object.entries(blameRes)) {
      if (result['devData'][name]) {
        result['devData'][name]['linesOwned'] = val;
      }
    }
    setData(result);
  }, [rawData, activeFiles, excludedCommits, excludeCommits, filterMergeCommits]);

  //calculate the data for relevant (selected) developers
  useEffect(() => {
    if (!data) return;

    //first find out which authors are relevant using the universal data
    const authors = selectedAuthors.map((a) => (a === 'others' ? 'other' : a));

    //only consider dev data of selected authors
    const relevantDevData = {};

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
              relevantDevData[author.mainCommitter].commits.concat(data.devData[alias].commits),
            );
          }
        }
      }
    }

    //if there are authors in the 'other' category, combine their data
    if (authors.includes('other')) {
      //get other authors
      const signatures = otherAuthors.map((a) => a.signature);
      const otherResult = { linesOwned: 0, additions: 0, commits: [] };
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
