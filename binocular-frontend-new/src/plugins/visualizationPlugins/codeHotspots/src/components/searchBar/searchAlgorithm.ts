import type { FileListElementType } from '../../../../../../types/data/fileListType';

export default class SearchAlgorithm {
  static performFileSearch(dataSet: FileListElementType[], searchTerm: string): FileListElementType[] {
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
            filteredDataSet = filteredDataSet.filter((d) =>
              d.element.path.split('/')[d.element.path.split('/').length - 1].split('.')[0].toLowerCase().includes(searchTermChunks[i]),
            );
          }
          break;
        case '-t':
        case '-type':
          if (i < searchTermChunks.length - 1) {
            i++;
            filteredDataSet = filteredDataSet.filter((d) =>
              d.element.path.split('.')[d.element.path.split('.').length - 1].toLowerCase().includes(searchTermChunks[i]),
            );
          }
          break;
        default:
          break;
      }
    }

    return filteredDataSet;
  }
}
