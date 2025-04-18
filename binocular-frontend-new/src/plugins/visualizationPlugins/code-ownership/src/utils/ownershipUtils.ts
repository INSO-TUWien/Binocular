import { FileOwnershipCollection, OwnershipData, OwnershipResult } from '../../../../../types/data/ownershipType.ts';
import { DataPluginCommit, DataPluginFileOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export function extractOwnershipFromFileExcludingCommits(
  fileOwnershipData: DataPluginFileOwnership[],
  commitsToExclude: DataPluginCommit[] = [],
): OwnershipResult[] {
  return fileOwnershipData.map((o) => {
    const res: OwnershipResult = {
      user: o.user,
      ownedLines: 0,
    };

    // iterate over owned hunks, only count those of commits that are not excluded
    for (const hunk of o.hunks) {
      if (!commitsToExclude.includes(hunk.originalCommit)) {
        for (const lineObj of hunk.lines) {
          res.ownedLines += lineObj.to - lineObj.from + 1;
        }
      }
    }
    return res;
  });
}

//returns an object with filepaths as keys and the most recent ownership data for each file as values
// ignores changes made by commits specified in the commitsToExclude parameter
export function extractFileOwnership(ownershipData: OwnershipData[], commitsToExclude: DataPluginCommit[] = []) {
  //(copy and) reverse array so we have the most recent commits first
  const commits = ownershipData.toReversed();
  const result: FileOwnershipCollection = {};
  for (const commit of commits) {
    for (const file of commit.files!) {
      //since we start with the most recent commit, we are only interested in the first occurrence of each file.
      if (!result[file.path]) {
        // iterate over all users
        result[file.path] = extractOwnershipFromFileExcludingCommits(file.ownership, commitsToExclude);
      }
    }
  }
  return result;
}

//considers the merged authors from the universal settings and merges the ownership data used for the filepicker accordingly
//returns null if any of the parameters is null or undefined
//export function ownershipDataForMergedAuthors(mergedAuthors, otherAuthors, authorColors, ownershipForFiles, files) {
//  if (!mergedAuthors || !otherAuthors || !authorColors || !ownershipForFiles || !files) return null;
//
//  const result = {};
//
//  for (const [filename, ownership] of Object.entries(ownershipForFiles)) {
//    //we are only interested in ownership data of files that actually exist on this branch at the moment
//    if (!files.includes(filename)) continue;
//
//    const mergedOwnership = {};
//
//    //for every user that ownes lines of this file
//    for (const user of ownership) {
//      const sig = user.user;
//      const lines = user.ownedLines;
//
//      //first check if this author is in the 'other' category
//      if (otherAuthors.map((a) => a.signature).includes(sig)) {
//        if (!mergedOwnership['other']) {
//          mergedOwnership['other'] = lines;
//        } else {
//          mergedOwnership['other'] += lines;
//        }
//      } else {
//        //else check who is the main committer / if this is an alias
//        for (const committer of mergedAuthors) {
//          let breakOut = false;
//          const mainSignature = committer.mainCommitter;
//          for (const alias of committer.committers) {
//            //if the user is an alias of this main committer
//            if (alias.signature === sig) {
//              if (!mergedOwnership[mainSignature]) {
//                mergedOwnership[mainSignature] = lines;
//              } else {
//                mergedOwnership[mainSignature] += lines;
//              }
//              //we found the right committer, so we can stop searching
//              breakOut = true;
//              break;
//            }
//          }
//          if (breakOut) break;
//        }
//      }
//    }
//    //bring it to the same form as the original ownership data
//    result[filename] = Object.entries(mergedOwnership).map(([sig, lines]) => {
//      return { signature: sig, ownedLines: lines };
//    });
//  }
//
//  return result;
//}
