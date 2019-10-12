'use strict';

import {fileList} from "./getAllFiles";

export var filesForDev = [];
export var numOfCommits = 0;

export default function getFilesForDeveloper(developer) {

  filesForDev = [];
  numOfCommits = 0;

  for (let i = 0; i < fileList.length; i++) {
    for (let j = 0; j < fileList[i].commits.length; j++) {
      if(fileList[i].commits[j].signature === developer) {
        filesForDev.push({value:fileList[i].path, label: fileList[i].path});
        break;
      }
    }
  }

  for (let i = 0; i < fileList.length; i++) {
    for (let j = 0; j < fileList[i].commits.length; j++) {
      if(fileList[i].commits[j].signature === developer) {
        numOfCommits++;
      }
    }
  }
  console.log('Developers files:', filesForDev);
}
