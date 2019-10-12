'use strict';

import {graphQl, traversePages} from "../../../utils";
import {FileFilter} from "../entity/fileFilter";
import {CommitEnt} from "../entity/commitEnt";
import {FileEnt} from "../entity/fileEnt";

export const arrayOfFiles = [];
export const fileList = [];

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
                 lineCount
                     hunks {
                       newStart
                       newLines
                       oldStart
                       oldLines
                       webUrl
                     }
                  commit {
                  signature
                  sha
                  date
                  }
                 }
                }
             }
       }`,
      {page, perPage}
    )
    .then(resp =>  resp.allFiles);
};

function getListOfFiles(list) {
  if(list.length !== fileList.length) {
    for (let i = 0; i < list.length; i++) {
      let commitList = [];
      for (let j = 0; j < list[i].commits.length; j++) {
        let hunkList = [];
        for (let k = 0; k <list[i].commits[j].hunks.length; k++) {
          hunkList.push(list[i].commits[j].hunks[k]);
        }
        let tempCommit = new CommitEnt(list[i].commits[j].commit.signature,list[i].commits[j].commit.date, list[i].commits[j].commit.sha, hunkList,list[i].commits[j].lineCount);
        commitList.push(tempCommit);
      }
      let tempFile = new FileEnt(list[i].path, commitList);
      fileList.push(tempFile);
    }
  }
  console.log('FILE LIST: ', fileList);
}


export default function getFiles() {
  let list = [];
  let fileList = [];
  traversePages(getOneFile, file => {
    let devList = [];
    for( let i = 0; i< file.commits.length; i++) {
      if(!devList.includes(file.commits[i].commit.signature)){
        devList.push(file.commits[i].commit.signature);
      }
    }
    let tempFile = new FileFilter(file.path, file.commits.length, devList.length);
    list.push(file);
    fileList.push(tempFile);
  }).then(function () {
    if(arrayOfFiles.length !== fileList.length){
      for (let i = 0; i < fileList.length; i++) {
        arrayOfFiles.push(fileList[i]);
      }
      getListOfFiles(list);
    }
  });

}
