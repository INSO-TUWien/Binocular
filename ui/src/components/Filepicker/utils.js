//returns an object with filepaths as keys and the most recent ownership data for each file as values
//needed for the ownership indicators of the filepicker
export function extractFileOwnership(ownershipData) {
  //(copy and) reverse array so we have the most recent commits first
  const commits = ownershipData.toReversed();
  const result = {};
  for (const commit of commits) {
    for (const file of commit.files) {
      //since we start with the most recent commit, we are only interested in the first occurence of each file
      //and because this is used for the filepicker, we are also not concerned about file renames
      if (!result[file.path]) {
        result[file.path] = file.ownership;
      }
    }
  }
  return result;
}

//considers the merged authors from the universal settings and merges the ownership data used for the filepicker accordingly
//returns null if any of the parameters is null or undefined
export function ownershipDataForMergedAuthors(mergedAuthors, otherAuthors, authorColors, ownershipForFiles, files) {
  
  if (!mergedAuthors || !otherAuthors || !authorColors || !ownershipForFiles || !files) return null;
  
  let result = {};

  for (const [filename, ownership] of Object.entries(ownershipForFiles)) {
    //we are only interested in ownership data of files that actually exist on this branch at the moment
    if (!files.includes(filename)) continue;

    let mergedOwnership = {};

    //for every stakeholder that ownes lines of this file
    for (const stakeholder of ownership) {
      const sig = stakeholder.stakeholder;
      const lines = stakeholder.ownedLines;

      //first check if this author is in the 'other' category
      if (otherAuthors.map((a) => a.signature).includes(sig)) {
        if (!mergedOwnership["other"]) {
          mergedOwnership["other"] = lines;
        } else {
          mergedOwnership["other"] += lines;
        }
      } else {
        //else check who is the main committer / if this is an alias
        for (const committer of mergedAuthors) {
          let breakOut = false;
          const mainSignature = committer.mainCommitter;
          for (const alias of committer.committers) {
            //if the stakeholder is an alias of this main committer
            if (alias.signature === sig) {
              if (!mergedOwnership[mainSignature]) {
                mergedOwnership[mainSignature] = lines;
              } else {
                mergedOwnership[mainSignature] += lines;
              }
              //we found the right committer, so we can stop searching
              breakOut = true;
              break;
            }
          }
          if (breakOut) break;
        }
      }
    }
    //bring it to the same form as the original ownership data
    result[filename] = Object.entries(mergedOwnership).map(([sig, lines]) => {
      return { signature: sig, ownedLines: lines };
    });
  }

  return result;
}
