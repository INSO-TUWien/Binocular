// get all entries of a collection of a database
import { expect } from 'chai';

export const getAllEntriesInCollection = async (db, collection) => {
  return (await db.query('FOR i IN @@collection RETURN i', { '@collection': collection })).all();
};

// takes array of collection names and returns an object with the collection names as keys and the respective entries as values
export const getAllRelevantCollections = async (db, relevantCollections) => {
  const res = {};
  await Promise.all(
    relevantCollections.map(async (collectionName) => {
      res[collectionName] = await getAllEntriesInCollection(db, collectionName);
    }),
  );
  return res;
};

// finds all entries in collection that fit the specified example
const findInCollection = (example, collectionArray) => {
  let res = collectionArray;
  Object.entries(example).forEach(([key, value]) => {
    res = res.filter((conn) => conn[key] && conn[key] === value);
  });
  return res;
};

// checks if there are a certain number of entries in the collectionArray that fit the specified example.
// returns the found examples
export const expectExamples = (example, collectionArray, number) => {
  const res = findInCollection(example, collectionArray);
  expect(res.length).to.equal(number);
  return res;
};

// the github mock implementation returns some standard test data.
// But for some tests, we need the mock api to return something else.
export const remapGitHubApiCall = (indexer, functionName, newData) => {
  if (indexer.controller === null || indexer.controller === undefined) {
    throw Error('Test Error: indexer.controller does not exist, function "' + functionName + '" cannot be remapped');
  }
  const fun = indexer.controller[functionName];
  if (fun === null || fun === undefined) {
    throw Error('Test Error: function "' + functionName + '" does not exist, cannot be remapped');
  }
  indexer.controller[functionName] = () => {
    return new Promise((resolve) => {
      resolve(newData);
    });
  };
};

// the gitlab mock implementation returns some standard test data.
// But for some tests, we need the mock api to return something else.
export const remapGitlabApiCall = (indexer, functionName, newData) => {
  if (indexer.gitlab === null || indexer.gitlab === undefined) {
    throw Error('Test Error: indexer.gitlab does not exist, function "' + functionName + '" cannot be remapped');
  }
  const fun = indexer.gitlab[functionName];
  if (fun === null || fun === undefined) {
    throw Error('Test Error: function "' + functionName + '" does not exist, cannot be remapped');
  }
  indexer.gitlab[functionName] = () => {
    return indexer.gitlab.testPaginator(newData);
  };
};

export const remapUnpaginatedGitlabApiCall = (indexer, functionName, newData) => {
  if (indexer.gitlab === null || indexer.gitlab === undefined) {
    throw Error('Test Error: indexer.gitlab does not exist, function "' + functionName + '" cannot be remapped');
  }
  const fun = indexer.gitlab[functionName];
  if (fun === null || fun === undefined) {
    throw Error('Test Error: function "' + functionName + '" does not exist, cannot be remapped');
  }
  indexer.gitlab[functionName] = () => {
    return Promise.resolve(newData);
  };
};

export const checkOwnedLines = (ownershipEntry, originalCommitHash, from, to) => {
  const relevantHunks = ownershipEntry.hunks.filter((h) => h.originalCommit === originalCommitHash);
  for (const hunk of relevantHunks) {
    for (const lineObject of hunk.lines) {
      // eslint-disable-next-line eqeqeq
      if (lineObject.from == from && lineObject.to == to) {
        return;
      }
    }
  }
  // if there are no hunks where the specified lines are owned, throw an exception
  throw Error(
    `Test Error: ownership entry does not contain ownership record fro original commit ${originalCommitHash} for lines ${from}-${to}`,
  );
};
