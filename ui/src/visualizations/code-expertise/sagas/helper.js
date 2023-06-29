'use strict';

import { endpointUrl } from '../../../utils';
import Database from '../../../database/database';
import _ from 'lodash';

const minDate = new Date(0);
const maxDate = new Date();

//get the blame data for a specific commit and for specific files
export function getBlameModules(sha, files) {
  return fetch(endpointUrl('blame/modules'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha: sha,
      files: files,
    }),
  }).then((resp) => resp.json());
}

//get the blame data for a specific commit and for specific files
export function getBlameIssues(sha, files, hashes) {
  return fetch(endpointUrl('blame/issues'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sha: sha,
      files: files,
      hashes: hashes,
    }),
  }).then((resp) => resp.json());
}

export function getIssues() {
  return Database.getIssueData([], [minDate, maxDate]);
}

export function getCommitHashesForIssue(iid) {
  return Database.getCommitsForIssue(iid).then((commits) => commits.map((c) => c.sha));
}

export async function getPreviousFilenames(filenames, branch) {
  //if this branch tracks file renames, we first have to find out how the relevant files were named in the past
  let filePathsWithPreviousNames = []
  let previousFilenameObjects = []
  if(branch.tracksFileRenames) {
    filePathsWithPreviousNames = await Database.getPreviousFilenamesForFilesOnBranch(branch.branch);
    //we only care about files that were renamed
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn) => pfn.previousFileNames.length !== 0);
    //we only care about the previous names of selected files
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn) => filenames.includes(pfn.path));
    //add these named to the filenames array
    for(const pfn of filePathsWithPreviousNames) {
      for (const oldFile of pfn.previousFileNames) {
        previousFilenameObjects.push(oldFile)
      }
    }
  }
  return previousFilenameObjects;
}

export async function getCommitHashesForFiles(filenames, branch) {
  let previousFilenameObjects = await getPreviousFilenames(filenames, branch)

  //fetch commits for selected files
  let commits = await Database.getCommitsForFiles(filenames)

  //fetch commits for old filenames
  let previousFilenamesPaths = [...new Set(previousFilenameObjects.map((fno) => fno.oldFilePath))]

  //TODO this does not return in offline mode
  let prevFilesCommits = [];
  if(previousFilenamesPaths.length > 0) {
    prevFilesCommits = await Database.getCommitsWithFilesForFiles(previousFilenamesPaths)
  }

  //for each of the previous filenames
  for (const prevPath of previousFilenamesPaths) {
    //extract the commits that touch this particular file
    let commitsForOldFilename = prevFilesCommits.filter(c => c.files.data.map(f => f.file.path).includes(prevPath))
  
    //now remove the commits that touch the previous filenames but not within the time period where this file was named this way
    // this can for example happen when a file was renamed and later on, a new file with the same name is created again
    // we are not interested in the commits touching this "new" file
    commitsForOldFilename = commitsForOldFilename.filter(c => {
      const commitDate = new Date(c.date);
      //there could be more files with this name in other time intervals
      const prevFileObjects = previousFilenameObjects.filter((pfno) => pfno.oldFilePath === prevPath)
      for(const prevFileObj of prevFileObjects) {
        //if hasThisNameUntil is null, this means that this is the current name of the file.
        // since this commit is then in the 'commits' array anyways, we can ignore it here
        if(prevFileObj.hasThisNameUntil === null) return false

        const fileWasNamedFrom = new Date(prevFileObj.hasThisNameFrom)
        const fileWasNamedUntil = new Date(prevFileObj.hasThisNameUntil)
        //if this commit touches a previous version of this file in the right timeframe, we keep this commit
        if(fileWasNamedFrom <= commitDate && commitDate < fileWasNamedUntil) {
          return true;
        }
      }
      return false;
    })
    commits = _.concat(commits, commitsForOldFilename)
  }
  //get sha hashes
  return _.uniq(commits.map((c) => c.sha))
}

export function getIssueData(iid) {
  //TODO use separate function that only queries for specific issue
  return getIssues().then((resp) => resp.filter((i) => i.iid === parseInt(iid))[0]);
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

export function getFilesForCommits(hashes) {
  return Database.getFilesForCommits(hashes);
}

export function addBuildData(relevantCommits, builds) {
  return relevantCommits.map((commit) => {
    const resultCommit = commit;
    resultCommit['build'] = null;
    const relevantBuilds = builds.filter((build) => build.sha === commit.sha);
    if (relevantBuilds.length > 0) {
      resultCommit['build'] = relevantBuilds[0].status;
      resultCommit['buildUrl'] = relevantBuilds[0].webUrl;
    }
    return resultCommit;
  });
}

export function getAllCommits() {
  return Database.getCommitDataWithFiles([minDate, maxDate], [minDate, maxDate]);
}

//recursively get all parent commits of the selected branch.
export function getCommitsForBranch(branch, allCommits) {
  const latestCommitSha = branch.latestCommit;
  const latestCommit = allCommits.filter((commit) => commit.sha === latestCommitSha)[0];
  const history = latestCommit.history.split(',');
  return allCommits.filter((c) => _.includes(history, c.sha));
}
