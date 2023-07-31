'use strict';

import Database from '../../../database/database';
import _ from 'lodash';

const minDate = new Date(0);
const maxDate = new Date();

export async function modulesModeData(activeFiles, currentBranch) {
  const allCommits = await getAllCommits();
  const previousFilenames = await getPreviousFilenames(activeFiles, currentBranch);
  const relevantCommitHashes = getCommitHashesForFiles(allCommits, activeFiles, previousFilenames);
  const buildData = await getAllBuildData();
  return [allCommits, relevantCommitHashes, buildData, previousFilenames];
}

export async function issuesModeData(activeFiles, currentBranch, issueId) {
  const allCommits = await getAllCommits();
  const previousFilenames = await getPreviousFilenames(activeFiles, currentBranch);
  const issueData = await getIssueData(issueId);
  const relevantCommitHashes = await getCommitHashesForIssue(issueId);
  const buildData = await getAllBuildData();

  return [allCommits, issueData, relevantCommitHashes, buildData, previousFilenames];
}

export async function getBlameModules(commit, files) {
  let filesLeft = files;
  //this contains the timeline of all commits from the initial commit until the most recent one
  let branchCommits = commit.history.split(',').reverse();
  let ownershipData = await Database.getOwnershipDataForFiles(files);
  let result = {};

  for (const fileObject of ownershipData) {
    const path = fileObject.path;
    let relatedCommitsAndOwnership = fileObject.ownership;

    //we are only interested in the commits of the current branch
    relatedCommitsAndOwnership = relatedCommitsAndOwnership.filter((c) => branchCommits.includes(c.commit.sha));

    if (relatedCommitsAndOwnership.length !== 0) {
      //sort to get most recent one
      relatedCommitsAndOwnership = relatedCommitsAndOwnership.sort((x, y) => (new Date(x.commit.date) < new Date(y.commit.date) ? 1 : -1));
      const latestOwnershipData = relatedCommitsAndOwnership[0].ownership;

      for (const ownershipElement of latestOwnershipData) {
        if (!result[ownershipElement.stakeholder]) {
          result[ownershipElement.stakeholder] = ownershipElement.ownedLines;
        } else {
          result[ownershipElement.stakeholder] += ownershipElement.ownedLines;
        }
      }

      filesLeft = _.without(filesLeft, path);
    }
  }

  if (filesLeft.length !== 0) {
    console.log('Error in Code Expertise Visualization: no ownership data found for the following file(s):', filesLeft);
  }

  return result;
}

//this steps through all commits (from most recent one backwards)
// and collects ownership data until it has the most recent data for every file.
//is *way* slower than getBlameModules, but may be of use for different usecases.
// export async function getBlameModulesAlternative(commit, files) {
//   //this contains the timeline of all commits from the initial commit until the most recent one
//   let commitsLeft = commit.history.split(',').reverse();
//   //filesLeft contains all files we want to get the ownership data from.
//   let filesLeft = files;
//   let result = {};

//   while (filesLeft.length !== 0 && commitsLeft.length !== 0) {
//     //remove the first (latest) commit from the commitsLeft array
//     const currentSha = commitsLeft.pop();
//     let ownershipData = await Database.getOwnershipDataForCommit(currentSha);

//     //we are only interested in ownership data related to filesLeft
//     ownershipData = ownershipData.filter((o) => filesLeft.includes(o.path));

//     //if this commit touches files we are interested in, extract the ownership data
//     if (ownershipData.length !== 0) {
//       //for each relevant file
//       for (const fileOwnershipElement of ownershipData) {
//         //for each ownership element of the current file
//         for (const ownershipElement of fileOwnershipElement.ownership) {
//           if (!result[ownershipElement.stakeholder]) {
//             result[ownershipElement.stakeholder] = ownershipElement.ownedLines;
//           } else {
//             result[ownershipElement.stakeholder] += ownershipElement.ownedLines;
//           }
//         }
//       }
//       //we now have the most recent ownership data of this file. This means we dont have to extract ownership data for this file anymore
//       filesLeft = _.without(filesLeft, ...ownershipData.map((o) => o.path));
//     }
//   }

//   if (filesLeft.length !== 0) {
//     console.log('Error in Code Expertise Visualization: no ownership data found for the following file(s):', filesLeft);
//   }
//   return result;
// }

export function getIssues() {
  return Database.getIssueData([], [minDate, maxDate]);
}

export function getCommitHashesForIssue(iid) {
  return Database.getCommitsForIssue(iid).then((commits) => commits.map((c) => c.sha));
}

export async function getPreviousFilenames(filenames, branch) {
  //if this branch tracks file renames, we first have to find out how the relevant files were named in the past
  let filePathsWithPreviousNames = [];
  const previousFilenameObjects = [];
  if (branch.tracksFileRenames) {
    filePathsWithPreviousNames = await Database.getPreviousFilenamesForFilesOnBranch(branch.branch);
    //we only care about files that were renamed
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn) => pfn.previousFileNames.length !== 0);
    //we only care about the previous names of selected files
    filePathsWithPreviousNames = filePathsWithPreviousNames.filter((pfn) => filenames.includes(pfn.path));
    //add these named to the filenames array
    for (const pfn of filePathsWithPreviousNames) {
      for (const oldFile of pfn.previousFileNames) {
        previousFilenameObjects.push(oldFile);
      }
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
