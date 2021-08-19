'use strict';
export default class Search {
  static performSearch(dataSet, searchTerm) {
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
            filteredDataSet = filteredDataSet.filter(d => d.key.split('/')[d.key.split('/').length - 1].includes(searchTermChunks[i]));
          }
          break;
        case '-t':
        case '-type':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter(d => d.key.split('.')[d.key.split('.').length - 1].includes(searchTermChunks[i]));
          }
          break;
        default:
          filteredDataSet = filteredDataSet.filter(d => d.key.includes(searchTermChunks[i]));
          break;
      }
    }

    return filteredDataSet;
  }
}
