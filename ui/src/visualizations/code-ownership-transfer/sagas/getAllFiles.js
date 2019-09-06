'use strict';

import {graphQl, traversePages} from "../../../utils";

export const getAllFiles = () => {
  return graphQl
    .query(
      `query($path: String!) {
             file(path: $path) {
               path,
               maxLength
             }
          }`
    ).then(resp => resp.files);
};

export default function getFiles() {
  const fileList = [];
  traversePages(getAllFiles, file => {
      fileList.push(file);
      console.log(file);

    }
  ).then(function () {
    console.log('ALL Files:', fileList);
  });
}
