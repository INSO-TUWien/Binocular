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
              date
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
    .then(resp => commitsToNodesAndLinks(resp.commits.data, config))
};

var filteredPaths = [];
var folderIds = {};
var meanPercentageOfCombinedCommitsThreshold = 40;
var meanPercentageOfMaxCommitsThreshold = 40;

function commitsToNodesAndLinks(commits, config) {
  var depth = config.depth;
  var fileLineCountsQuantile = 10;
  var fromTimestamp = config.fromTimestamp;
  var toTimestamp = config.toTimestamp;
  var showLinkedFiles = config.showLinkedFiles;

  meanPercentageOfCombinedCommitsThreshold = config.meanPercentageOfCombinedCommitsThreshold;
  meanPercentageOfMaxCommitsThreshold = config.meanPercentageOfMaxCommitsThreshold;

  var fileArray = Array();
  var links = Array();
  var fileTree = {
    id: 0,
    parentId: null,
    path: "",
    children: [],
    type: "folder",
    name: "Select All",
    isExpanded: true,
    isChecked: true
  };
  var nodeInTreeIds = {};

  filteredPaths = [];
  if(config.fileTree.length > 0) {
    setFilteredIds(config.fileTree[0].children);
  }

  commits.forEach(commit => {
    var commitTimestamp = Date.parse(commit.date);

    if((fromTimestamp == 0 || commitTimestamp >= fromTimestamp) && (toTimestamp == 0 || commitTimestamp <= toTimestamp)) {
      var fileCount = 0;

      var processedNodes = Array();
      commit.files.data.forEach(file => {
        var node = createOrUpdateNode(file, fileArray, depth, fileTree, nodeInTreeIds, showLinkedFiles);

        if(!!node) {
          if(!processedNodes.includes(node.id)) {
            processedNodes.push(node.id);

            var processedTargetNodes = Array();
            for(var i = fileCount+1; i < commit.files.data.length; i++) {
              var targetNode = createNode(commit.files.data[i], depth, showLinkedFiles);

              if(!!targetNode) {
                if(node.id != targetNode.id && !processedTargetNodes.includes(targetNode.id)) {
                  processedTargetNodes.push(targetNode.id);

                  if(!links.some(link => link.target == targetNode.id && link.source == node.id)
                      && !links.some(link => link.target == node.id && link.source == targetNode.id)) {
                      links.push({ target: targetNode.id, source: node.id, commitCount: 1 });
                  } else {
                    if(links.some(link => link.target == targetNode.id && link.source == node.id)) {
                      var matchingLinks = links.filter(link => link.target == targetNode.id && link.source == node.id);

                      matchingLinks.forEach(matchingLink => {
                        matchingLink.commitCount++;
                      });
                    } else if(links.some(link => link.target == node.id && link.source == targetNode.id)) {
                      var matchingLinks = links.filter(link => link.target == node.id && link.source == targetNode.id);
                      
                      matchingLinks.forEach(matchingLink => {
                        matchingLink.commitCount++;
                      });
                    }
                  }
                }
              }
            }
          }
        }
        fileCount++;
      });
    }
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
      if(file.type == "file") {
        fileCommitCountsArray.push(file.commitCount);
        fileCommitSum += file.commitCount;
      } else if(file.type == "folder") {
        folderCommitCountsArray.push(file.commitCount);
        folderCommitSum += file.commitCount;
      }
    }
  });

  fileCommitCountsArray.sort(function(a, b){return a-b});
  folderCommitCountsArray.sort(function(a, b){return a-b});

  var minCommitCount = fileCommitCountsArray[0];
  var maxCommitCount = fileCommitCountsArray[fileCommitCountsArray.length-1];
  var meanCommitCount = fileCommitSum / fileCommitCountsArray.length;

  var minFolderCommitCount = folderCommitCountsArray[0];
  var maxFolderCommitCount = folderCommitCountsArray[folderCommitCountsArray.length-1];
  var meanFolderCommitCount = folderCommitSum / folderCommitCountsArray.length;

  fileArray.forEach(file => {
    if(!!file) {
      if(isNodeLinkedToSelectedNode(file, links, fileArray, maxCommitCount, maxFolderCommitCount) || !showLinkedFiles) {
        nodes.push(file);

        if(file.type == "file") {
          fileLineCountsArray.push(file.lineCount);
        } else if(file.type == "folder") {
          folderLineCountsArray.push(file.lineCount);
        }
      } else {
        removeLinksWithNode(file, links);
      }
    }
  });

  fileLineCountsArray.sort(function(a, b){return a-b});

  folderLineCountsArray.sort(function(a, b){return a-b});


  var minLineCount = fileLineCountsArray[Math.round(fileLineCountsArray.length/fileLineCountsQuantile)];
  var maxLineCount = fileLineCountsArray[Math.round(fileLineCountsArray.length - (fileLineCountsArray.length/fileLineCountsQuantile))];

  if(fileLineCountsArray.length < fileLineCountsQuantile) {
    minLineCount = fileLineCountsArray[0];
    maxLineCount = fileLineCountsArray[fileLineCountsArray.length - 1];
  }

  var minFolderLineCount = folderLineCountsArray[0];
  var maxFolderLineCount = folderLineCountsArray[folderLineCountsArray.length-1];

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
    meanFolderCommitCount: meanFolderCommitCount,
    totalCommitCount: (fileCommitSum + folderCommitSum),
    meanPercentageOfCombinedCommitsThreshold: config.meanPercentageOfCombinedCommitsThreshold,
    meanPercentageOfMaxCommitsThreshold: config.meanPercentageOfMaxCommitsThreshold,
    fileTree: fileTree
   };
}

function createOrUpdateNode(file, fileArray, depth, fileTree, nodesInTreeIds, showLinkedFiles) {
  if(getDepth(file) <= depth) {  //file
    if(!isNodeInFilteredFiles(getFileId(file), file.file.path, showLinkedFiles)) {
      return null;
    }
    if(!!fileArray[getFileId(file)]) {
      fileArray[getFileId(file)].path = file.file.path;
      fileArray[getFileId(file)].lineCount = file.lineCount;
      fileArray[getFileId(file)].commitCount++;
    } else {
      fileArray[getFileId(file)] = { id: getFileId(file), path: file.file.path, lineCount: file.lineCount, commitCount: 1, type: "file" };

      addNodeToFileTree(fileTree, nodesInTreeIds, file.file.path, "file", getFileId(file));
    }

    return fileArray[getFileId(file)];
  } else {                            //folder
    var folderPath = getFolderPath(file, depth);

    if(!isNodeInFilteredFiles(getFolderId(folderPath), folderPath, showLinkedFiles)) {
      return null;
    }
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

      addNodeToFileTree(fileTree, nodesInTreeIds, folderPath, "folder", null);
    }

    return fileArray[getFolderId(folderPath)];
  }
}

function createNode(file, depth, showLinkedFiles) {
  if(getDepth(file) <= depth) {  //file
    if(!isNodeInFilteredFiles(getFileId(file), file.file.path, showLinkedFiles)) {
      return null;
    }
    return { id: getFileId(file), path: file.file.path, lineCount: file.lineCount, commitCount: 1, type: "file" };
  } else {                            //folder
    var folderPath = getFolderPath(file, depth);
    if(!isNodeInFilteredFiles(getFolderId(folderPath), folderPath, showLinkedFiles)) {
      return null;
    }
    return { id: getFolderId(folderPath) , path: folderPath, fileCount: 1, commitCount: 1, type: "folder" };
  }
}

function addNodeToFileTree(fileTree, nodesInTreeIds, path, type, fileId) {
  addNodeToFileTreeRecursive(fileTree, nodesInTreeIds, path, type, fileId);
}

function addNodeToFileTreeRecursive(rootNode, nodesInTreeIds, path, type, fileId) {
  let parts = path.split("/");

  if(parts.length == 0) {
    return;
  } else {
    let nodeToAdd = parts[0];

    let t = "folder";
    if(parts.length == 1) {
      t = type;
    }

    let id = getFolderId(rootNode.path + "/" + nodeToAdd);
    if(t == "file") {
      id = fileId;
    }

    let node = nodesInTreeIds[id];
    if(node == null || typeof node == "undefined") {
      node = {
        id: id,
        parentId: rootNode.id,
        path: rootNode.path + "/" + nodeToAdd,
        children: [],
        type: t,
        name: (rootNode.path + "/" + nodeToAdd).substr(1),
        isExpanded: t == "folder" ? true : false,
        isChecked: true
      }

      rootNode.children.push(node);
      nodesInTreeIds[id] = node;
    }    

    if(parts.length > 1) {
      addNodeToFileTreeRecursive(node, nodesInTreeIds, path.substring(path.indexOf('/')+1), type, fileId);
    }
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

function setFilteredIds(fileTree) {
  if(!!fileTree) {
    fileTree.forEach(child => {
      setFilteredIdsRecursive(child);
    });
  }
}

function setFilteredIdsRecursive(node) {
  if(node.isChecked) {
    filteredPaths.push(node.path);
  }

  if(!!node.children) {
    node.children.forEach(child => {
      setFilteredIdsRecursive(child);
    });
  }
}

function isNodeInFilteredFiles(id, path, showLinkedFiles) {
  if(filteredPaths.length <= 0 || showLinkedFiles) {
    return true;
  }

  var b = false;
  filteredPaths.forEach(p => {
    if(path.includes(p.substr(1))) {
      return b = true;;
    }
  });

  return b;
}

function isNodeLinkedToSelectedNode(node, links, fileArray, maxCommitCount, maxFolderCommitCount) {
  var b = false;

  if(isNodeInFilteredFiles(node.id, node.path, false)) {
    return true;
  }

  if(filteredPaths.length > 0) {
    links.forEach(link => {
      if(showLink(link.commitCount, fileArray[link.source], fileArray[link.target], maxCommitCount, maxFolderCommitCount) 
        && linkContainsNodeAndSelectedNode(link, node, fileArray)) {

        b = true;
      }
    });
  } else {
    b = true;
  }

  return b;
}

function showLink(combinedCommits, source, target, maxCommitCount, maxFolderCommitCount) {
  var sourceCommits = source.commitCount;
  var targetCommits = target.commitCount;

  var sourcePercentage = 100 / sourceCommits * combinedCommits;
  var targetPercentage = 100 / targetCommits * combinedCommits;

  var sourcePercentageOfMaxCommits = 100 / (source.type == "file" ? maxCommitCount : maxFolderCommitCount) * sourceCommits;
  var targetPercentageOfMaxCommits = 100 / (target.type == "file" ? maxCommitCount : maxFolderCommitCount) * targetCommits;

  if(((sourcePercentage + targetPercentage) / 2 >= meanPercentageOfCombinedCommitsThreshold)
      && ((sourcePercentageOfMaxCommits + targetPercentageOfMaxCommits) / 2 >= meanPercentageOfMaxCommitsThreshold)) {
    return true;
  }

  return false;
}

function linkContainsNodeAndSelectedNode(link, node, fileArray) {
  if(link.target == node.id && isNodeInFilteredFiles(link.source, fileArray[link.source].path, false)) {
    return true;
  }

  if(link.source == node.id && isNodeInFilteredFiles(link.target, fileArray[link.target].path, false)) {
    return true;
  }
}

function removeLinksWithNode(file, links) {
  var i = links.length;
  while (i--) {
    if (links[i].target == file.id || links[i].source == file.id) {
      links.splice(i, 1);
    }
  }
}
