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
