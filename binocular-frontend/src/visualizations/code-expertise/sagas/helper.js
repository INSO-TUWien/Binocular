'use strict';

import Database from '../../../database/database';
import _ from 'lodash';
import { extractOwnershipFromFileExcludingCommits } from '../../../utils/ownership.js';
import { getHistoryForCommit } from '../../../database/utils.js';

const minDate = new Date(0);
const maxDate = new Date();

export async function modulesModeData(currentBranch) {
  const allCommits = await getAllCommits();
  const previousFilenames = await getPreviousFilenames(currentBranch);
  const buildData = await getAllBuildData();
  return [allCommits, buildData, previousFilenames];
}

export async function issuesModeData(currentBranch, issueId) {
  const allCommits = await getAllCommits();
  const previousFilenames = await getPreviousFilenames(currentBranch);
  const issueData = await getIssueData(issueId);
  const relevantCommitHashes = await getCommitHashesForIssue(issueId);
  const buildData = await getAllBuildData();
  return [allCommits, issueData, relevantCommitHashes, buildData, previousFilenames];
}

//this steps through all commits (from most recent one backwards)
// and collects ownership data until it has the most recent data for every file.
export function getBlameModules(commit, files, allCommits, commitsToExclude) {
  //this contains the timeline of all commits from the initial commit until the most recent one
  const commitsLeft = getHistoryForCommit(commit, allCommits).reverse();
  //filesLeft contains all files we want to get the ownership data from.
  let filesLeft = files;
  const result = {};

  while (filesLeft.length !== 0 && commitsLeft.length !== 0) {
    //remove the first (latest) commit from the commitsLeft array
    const currentSha = commitsLeft.pop();
    let ownershipData = allCommits.filter((c) => c.sha === currentSha)[0];
    if (!ownershipData) {
      console.log('Error in code expertise getBlameModules: commit not found');
    }
    ownershipData = ownershipData.files.data.map((o) => {
      return {
        path: o.file.path,
        ownership: extractOwnershipFromFileExcludingCommits(o.ownership, commitsToExclude),
      };
    });

    //we are only interested in ownership data related to filesLeft
    ownershipData = ownershipData.filter((o) => filesLeft.includes(o.path));

    //if this commit touches files we are interested in, extract the ownership data
    if (ownershipData.length !== 0) {
      //for each relevant file
      for (const fileOwnershipElement of ownershipData) {
        //for each ownership element of the current file
        for (const ownershipElement of fileOwnershipElement.ownership) {
          if (!result[ownershipElement.user]) {
            result[ownershipElement.user] = ownershipElement.ownedLines;
          } else {
            result[ownershipElement.user] += ownershipElement.ownedLines;
          }
        }
      }
      //we now have the most recent ownership data of this file. This means we dont have to extract ownership data for this file anymore
      filesLeft = _.without(filesLeft, ...ownershipData.map((o) => o.path));
    }
  }

  if (filesLeft.length !== 0) {
    console.log('Error in Code Expertise Visualization: no ownership data found for the following file(s):', filesLeft);
  }
  return result;
}

export function getIssues() {
  return Database.getIssueData([], [minDate, maxDate]);
}

export function getCommitHashesForIssue(iid) {
  return Database.getCommitsForIssue(iid).then((commits) => commits.map((c) => c.sha));
}

export async function getPreviousFilenames(branch) {
  if (branch.tracksFileRenames) {
    return await Database.getPreviousFilenamesForFilesOnBranch(branch.branch);
  }
  return [];
}

export function extractRelevantPreviousFilenames(filenames, allPreviousFilenames) {
  //if this branch tracks file renames, we first have to find out how the relevant files were named in the past
  let filePathsWithPreviousNames = [];
  const previousFilenameObjects = [];
  //we only care about files that were renamed
  filePathsWithPreviousNames = allPreviousFilenames.filter((pfn) => pfn.previousFileNames.length !== 0);
  //we only care about the previous names of selected files
  filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn) => filenames.includes(pfn.path));
  //add these named to the filenames array
  for (const pfn of filePathsWithPreviousNames) {
    for (const oldFile of pfn.previousFileNames) {
      previousFilenameObjects.push(oldFile);
    }
  }
  return previousFilenameObjects;
}

export function getCommitHashesForFiles(allCommits, filenames, previousFilenameObjects) {
  //fetch commits for selected files
  let commits = allCommits.filter((c) => {
    for (const file of c.files.data) {
      if (filenames.includes(file.file.path)) {
        return true;
      }
    }
  });

  //fetch commits for old filenames
  const previousFilenamesPaths = [...new Set(previousFilenameObjects.map((fno) => fno.oldFilePath))];

  let prevFilesCommits = [];
  if (previousFilenamesPaths.length > 0) {
    prevFilesCommits = allCommits.filter((c) => {
      for (const file of c.files.data) {
        if (previousFilenamesPaths.includes(file.file.path)) {
          return true;
        }
      }
    });
  }

  //for each of the previous filenames
  for (const prevPath of previousFilenamesPaths) {
    //extract the commits that touch this particular file
    let commitsForOldFilename = prevFilesCommits.filter((c) => c.files.data.map((f) => f.file.path).includes(prevPath));

    //now remove the commits that touch the previous filenames but not within the time period where this file was named this way
    // this can for example happen when a file was renamed and later on, a new file with the same name is created again
    // we are not interested in the commits touching this "new" file
    commitsForOldFilename = commitsForOldFilename.filter((c) => {
      const commitDate = new Date(c.date);
      //there could be more files with this name in other time intervals
      const prevFileObjects = previousFilenameObjects.filter((pfno) => pfno.oldFilePath === prevPath);
      for (const prevFileObj of prevFileObjects) {
        //if hasThisNameUntil is null, this means that this is the current name of the file.
        // since this commit is then in the 'commits' array anyways, we can ignore it here
        if (prevFileObj.hasThisNameUntil === null) return false;

        const fileWasNamedFrom = new Date(prevFileObj.hasThisNameFrom);
        const fileWasNamedUntil = new Date(prevFileObj.hasThisNameUntil);
        //if this commit touches a previous version of this file in the right timeframe, we keep this commit
        if (fileWasNamedFrom <= commitDate && commitDate < fileWasNamedUntil) {
          return true;
        }
      }
      return false;
    });
    commits = _.concat(commits, commitsForOldFilename);
  }
  //get sha hashes
  const result = _.uniq(commits.map((c) => c.sha));
  return result;
}

export function getIssueData(iid) {
  //TODO use separate function that only queries for specific issue
  return getIssues().then((resp) => resp.filter((i) => parseInt(i.iid) === parseInt(iid))[0]);
}

export function getAllBuildData() {
  return Database.getBuildData([], [minDate, maxDate]);
}

export function getBranches() {
  return Database.getAllBranches().then((resp) => resp.branches.data);
}

export function getFilenamesForBranch(branchName) {
  return Database.getFilenamesForBranch(branchName);
}

export function addBuildData(relevantCommits, builds) {
  return relevantCommits.map((commit) => {
    const resultCommit = commit;
    resultCommit['build'] = null;
    const relevantBuilds = builds.filter((build) => build.commit && build.commit.sha === commit.sha);
    if (relevantBuilds.length > 0) {
      resultCommit['build'] = relevantBuilds[0].status;
      resultCommit['buildUrl'] = relevantBuilds[0].webUrl;
    }
    return resultCommit;
  });
}

export function getAllCommits() {
  return Database.getCommitDataWithFilesAndOwnership([minDate, maxDate], [minDate, maxDate]);
}

export function getCommitsForBranch(branch, allCommits) {
  const latestCommitSha = branch.latestCommit;
  const latestCommit = allCommits.filter((commit) => commit.sha === latestCommitSha)[0];
  const history = getHistoryForCommit(latestCommit, allCommits);
  return allCommits.filter((c) => _.includes(history, c.sha));
}

export function commitsToOwnership(commits) {
  return commits
    .map((c) => {
      return {
        sha: c.sha,
        date: c.date,
        files: c.files.data.map((f) => {
          return {
            path: f.file.path,
            ownership: f.ownership,
          };
        }),
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}
