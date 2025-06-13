import { FileOwnershipCollection, OwnershipData, OwnershipResult } from '../../../../../types/data/ownershipType.ts';
import { DataPluginFileOwnership } from '../../../../interfaces/dataPluginInterfaces/dataPluginCommits.ts';

export function extractOwnershipFromFileExcludingCommits(
  fileOwnershipData: DataPluginFileOwnership[],
  commitsToExclude: string[] = [],
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
export function extractFileOwnership(ownershipData: OwnershipData[], commitsToExclude: string[] = []) {
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
