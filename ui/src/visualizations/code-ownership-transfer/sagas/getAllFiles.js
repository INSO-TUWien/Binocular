'use strict';

import {graphQl, traversePages} from "../../../utils";
import {FileFilter} from "../entity/fileFilter";

export const arrayOfFiles = [];

export const getOneFile = (page, perPage) => {
  return graphQl
    .query(
      `query($page: Int, $perPage: Int){
             allFiles(page: $page, perPage: $perPage){
             count
               page
               perPage
               data {
                 path
                 commits{
                  signature
                  sha
                  message
                 }
                }
             }
       }`,
      {page, perPage}
    )
    .then(resp =>  resp.allFiles);
};


export default function getFiles() {
  let list = [];
  traversePages(getOneFile, file => {
    let devList = [];
    for( let i = 0; i< file.commits.length; i++) {
      if(!devList.includes(file.commits[i].signature)){
        devList.push(file.commits[i].signature);
      }
    }
    let tempFile = new FileFilter(file.path, file.commits.length, devList.length);
    list.push(file);
    arrayOfFiles.push(tempFile);
  }).then(function () {

    console.log('Files with commits:', list);
    console.log('Files filter list:', arrayOfFiles);

  });

}
