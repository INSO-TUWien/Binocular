'use strict';

import _ from 'lodash';
import { traversePages, graphQl } from '../../../utils';

export default function getFilesAndLinks(from, to) {
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
    .then(resp => commitsToNodesAndLinks(resp.commits.data));
};

function commitsToNodesAndLinks(commits) {
  var fileArray = Array();
  var links = Array();
  var commitCount = 0;

  var minLineCount = 99999;
  var maxLineCount = 0;

  commits.forEach(commit => {
    if(commitCount < 100) {
      var fileCount = 0;
      commit.files.data.forEach(file => {
        if(file.lineCount < minLineCount) {
          minLineCount = file.lineCount;
        }
        if(file.lineCount > maxLineCount) {
          maxLineCount = file.lineCount;
        }

        fileArray[file.file.id] = { id: file.file.id, path: file.file.path, lineCount: file.lineCount };

        for(var i = fileCount+1; i < commit.files.data.length; i++) {
          var targetFile = commit.files.data[i];

          if(!links.some(link => link.target == targetFile.file.id && link.source == file.file.id)
              && !links.some(link => link.target == file.file.id && link.source == targetFile.file.id)) {
              links.push({ target: targetFile.file.id, source: file.file.id, commitCount: 1 });
          } else {
            if(links.some(link => link.target == targetFile.file.id && link.source == file.file.id)) {
              var matchingLinks = links.filter(link => link.target == targetFile.file.id && link.source == file.file.id);
              
              matchingLinks.forEach(matchingLink => {
                matchingLink.commitCount++;
              });
            }
            if(links.some(link => link.target == file.file.id && link.source == targetFile.file.id)) {
              var matchingLinks = links.filter(link => link.target == file.file.id && link.source == targetFile.file.id);
              
              matchingLinks.forEach(matchingLink => {
                matchingLink.commitCount++;
              });
            }
          }
        }

        fileCount++;
      });
    }
    commitCount++;
  });

  var nodes = Array();

  fileArray.forEach(file => {
    if(!!file) {
      nodes.push(file);
    }
  });

  return { nodes: nodes, links: links, minLineCount: minLineCount, maxLineCount: maxLineCount };
}
