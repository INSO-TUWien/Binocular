'use strict';

import { traversePages, graphQl } from '../../../utils';

/**
 * Get files with commits from the database.
 * @returns {*}
 */
export default function getFiles() {
  const fileList = [];

  return traversePages(getFilesWithCommmits(), files => {
    fileList.push(files);
  }).then(function() {
    return fileList;
  });
}

const getFilesWithCommmits = until => (page, perPage) => {
  return graphQl
    .query(
      `query ($page: Int, $perPage: Int) {
  files(page: $page, perPage: $perPage) {
    data{
      path
      webUrl   
      commits{
        count
        data{
          sha
          date
        }
      }
    }
  }
}
`,
      { page, perPage }
    )
    .then(resp => resp.files);
};
