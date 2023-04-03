'use strict';

const git = require('isomorphic-git');
const fs = require('fs');

const log = require('debug')('getFilenames');

module.exports = function (req, res) {
  let branchName = req.body.branch; // the currently selected branch

  if (branchName) {
    if (!branchName.startsWith('origin')) {
      branchName = 'origin/' + branchName;
    }
    try {
      // retrieve all files of the project at the specified commit
      git.listFiles({ fs, dir: '.', ref: branchName }).then((files) => {
        res.json({
          success: true,
          files: files,
        });
      });
    } catch (e) {
      log('error in get-files.js: ', e);
      res.json({
        success: false,
        files: [],
      });
    }
  }
};
