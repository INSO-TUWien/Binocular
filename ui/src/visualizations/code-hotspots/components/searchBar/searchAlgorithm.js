'use strict';
export default class SearchAlgorithm {
  static performFileSearch(dataSet, searchTerm) {
    let filteredDataSet = dataSet;
    const searchTermChunks = searchTerm.toLowerCase().split(' ');

    for (let i = 0; i < searchTermChunks.length; i++) {
      switch (searchTermChunks[i]) {
        case '-':
          break;
        case '-f':
        case '-file':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter(d =>
              d.key.split('/')[d.key.split('/').length - 1].split('.')[0].toLowerCase().includes(searchTermChunks[i])
            );
          }
          break;
        case '-t':
        case '-type':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter(d =>
              d.key.split('.')[d.key.split('.').length - 1].toLowerCase().includes(searchTermChunks[i])
            );
          }
          break;
        default:
          filteredDataSet = filteredDataSet.filter(d => d.key.toLowerCase().includes(searchTermChunks[i]));
          break;
      }
    }

    return filteredDataSet;
  }

  static performCommitSearch(dataSet, searchTerm) {
    /**
     * branch
     * column
     * message
     * row
     * sha
     * signature
     * value
     */

    let filteredDataSet = dataSet.data;
    const searchTermChunks = searchTerm.toLowerCase().split(' ');
    for (let i = 0; i < searchTermChunks.length; i++) {
      switch (searchTermChunks[i]) {
        default:
          filteredDataSet = filteredDataSet.filter(
            d =>
              d.message.toLowerCase().includes(searchTermChunks[i]) ||
              d.branch.toLowerCase().includes(searchTermChunks[i]) ||
              d.sha.toLowerCase().includes(searchTermChunks[i]) ||
              d.signature.toLowerCase().includes(searchTermChunks[i])
          );
          break;
      }
    }
    return {
      data: filteredDataSet,
      lines: dataSet.lines,
      commits: dataSet.commits,
      devs: dataSet.devs,
      issues: dataSet.issues,
      maxValue: dataSet.maxValue,
      legendSteps: dataSet.legendSteps
    };
  }
}
