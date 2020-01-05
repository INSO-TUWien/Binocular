'use strict';

import _ from 'lodash';
import { traversePages, graphQl } from '../../../utils';
import { select, takeEvery, fork, throttle } from 'redux-saga/effects';

export default function getGraphData(config) {
  return graphQl
    .query(
      `{
          commits {
            data {
              sha
              files {
                data {
                  lineCount
                  file {
                    id
                    path
                  }
                }
              }
            }
          }
        }`
    )
    .then(resp => commitsToNodesAndLinks(resp.commits.data, config));
};

function commitsToNodesAndLinks(commits, config) {
  var depth = config.depth;
  var fileLineCountsQuantile = 10;
  var folderLineCountsQuantile = 10;

  var fileArray = Array();
  var links = Array();

  commits.forEach(commit => {
    var fileCount = 0;
    commit.files.data.forEach(file => {
      var node = createOrUpdateNode(file, fileArray, depth);

      for(var i = fileCount+1; i < commit.files.data.length; i++) {
        var targetNode = createNode(commit.files.data[i], depth);

        if(!links.some(link => link.target == targetNode.id && link.source == node.id)
            && !links.some(link => link.target == node.id && link.source == targetNode.id)) {
            links.push({ target: targetNode.id, source: node.id, commitCount: 1 });
        } else {
          if(links.some(link => link.target == targetNode.id && link.source == node.id)) {
            var matchingLinks = links.filter(link => link.target == targetNode.id && link.source == node.id);
            
            matchingLinks.forEach(matchingLink => {
              matchingLink.commitCount++;
            });
          }
          if(links.some(link => link.target == node.id && link.source == targetNode.id)) {
            var matchingLinks = links.filter(link => link.target == node.id && link.source == targetNode.id);
            
            matchingLinks.forEach(matchingLink => {
              matchingLink.commitCount++;
            });
          }
        }
      }

      fileCount++;
    });
  });

  var nodes = Array();
  var fileLineCountsArray = Array();
  var fileCommitCountsArray = Array();
  var fileCommitSum = 0;
  var folderLineCountsArray = Array();
  var folderCommitCountsArray = Array();
  var folderCommitSum = 0;

  fileArray.forEach(file => {
    if(!!file) {
      nodes.push(file);

      if(file.type == "file") {
        fileLineCountsArray.push(file.lineCount);
        fileCommitCountsArray.push(file.commitCount);
        fileCommitSum += file.commitCount;
      } else if(file.type == "folder") {
        folderLineCountsArray.push(file.lineCount);
        folderCommitCountsArray.push(file.commitCount);
        folderCommitSum += file.commitCount;
      }
    }
  });

  fileLineCountsArray.sort(function(a, b){return a-b});
  fileCommitCountsArray.sort(function(a, b){return a-b});

  folderLineCountsArray.sort(function(a, b){return a-b});
  folderCommitCountsArray.sort(function(a, b){return a-b});

  var minLineCount = fileLineCountsArray[Math.round(fileLineCountsArray.length/fileLineCountsQuantile)];
  var maxLineCount = fileLineCountsArray[Math.round(fileLineCountsArray.length - (fileLineCountsArray.length/fileLineCountsQuantile))];
  var minCommitCount = fileCommitCountsArray[0];
  var maxCommitCount = fileCommitCountsArray[fileCommitCountsArray.length-1];
  var meanCommitCount = fileCommitSum / fileCommitCountsArray.length;

  var minFolderLineCount = folderLineCountsArray[Math.round(folderLineCountsArray.length/folderLineCountsQuantile)];
  var maxFolderLineCount = folderLineCountsArray[Math.round(folderLineCountsArray.length - (folderLineCountsArray.length/folderLineCountsQuantile))];
  var minFolderCommitCount = folderCommitCountsArray[0];
  var maxFolderCommitCount = folderCommitCountsArray[folderCommitCountsArray.length-1];
  var meanFolderCommitCount = folderCommitSum / folderCommitCountsArray.length;

  return { nodes: nodes, 
    links: links, 
    minLineCount: minLineCount, 
    maxLineCount: maxLineCount, 
    minCommitCount: minCommitCount, 
    maxCommitCount: maxCommitCount,
    meanCommitCount: meanCommitCount,
    minFolderLineCount: minFolderLineCount,
    maxFolderLineCount: maxFolderLineCount,
    minFolderCommitCount: minFolderCommitCount,
    maxFolderCommitCount: maxFolderCommitCount,
    meanFolderCommitCount: meanFolderCommitCount };
}

function createOrUpdateNode(file, fileArray, depth) {
  if(getDepth(file) <= depth) {  //file
    if(!!fileArray[getFileId(file)]) {
      fileArray[getFileId(file)].path = file.file.path;
      fileArray[getFileId(file)].lineCount = file.lineCount;
      fileArray[getFileId(file)].commitCount++;
    } else {
      fileArray[getFileId(file)] = { id: getFileId(file), path: file.file.path, lineCount: file.lineCount, commitCount: 1, type: "file" };
    }

    return fileArray[getFileId(file)];
  } else {                            //folder
    var folderPath = getFolderPath(file, depth);

    if(!!fileArray[getFolderId(folderPath)]) {
      fileArray[getFolderId(folderPath)].path = folderPath;
      fileArray[getFolderId(folderPath)].commitCount++;

      if(!fileArray[getFolderId(folderPath)].files.some(fileInFolder => file.file.id == fileInFolder.file.id)) {
        fileArray[getFolderId(folderPath)].files.push(file);
        fileArray[getFolderId(folderPath)].lineCount += file.lineCount;
      }
    } else {
      let files = Array();
      files.push(file);
      fileArray[getFolderId(folderPath)] = { id: getFolderId(folderPath), path: folderPath, lineCount: file.lineCount, commitCount: 1, type: "folder", files: files };
    }

    return fileArray[getFolderId(folderPath)];
  }
}

function createNode(file, depth) {
  if(getDepth(file) <= depth) {  //file
    return { id: getFileId(file), path: file.file.path, lineCount: file.lineCount, commitCount: 1, type: "file" };
  } else {                            //folder
    var folderPath = getFolderPath(file, depth);
    return { id: getFolderId(folderPath) , path: folderPath, fileCount: 1, commitCount: 1, type: "folder" };
  }
}

function getDepth(file) {
  let pathArray = file.file.path.split("/");
  return pathArray.length;
}

function getFolderPath(file, depth) {
  if(typeof depth === "undefined" || isNaN(depth)) {
    return file.file.path;
  }

  let pathArray = file.file.path.split("/");
  let folderPath = "";

  pathArray.forEach(e => {
    if(depth > 0) {
      folderPath += e + "/";
      depth--;
    }
  });

  folderPath = folderPath.substring(0, folderPath.length - 1);

  return folderPath;
}

var folderIds = {};
function getFolderId(folderPath) {
  if(!!folderIds[folderPath]) {
    return folderIds[folderPath];
  } else {
    folderIds[folderPath] = "20" + "-" + Object.keys(folderIds).length;
    folderIds[folderPath] = folderIds[folderPath].replace("-", "");
    return folderIds[folderPath];
  }
}

function getFileId(file) {
  let id = "10" + "-" + file.file.id;
  id = id.replace("-", "");
  return id;
}
