'use strict';

const { execSync } = require('child_process');
const log = require('debug')('srv');

module.exports = function (req, res) {
  let branchName = req.body.branch; // the currently selected branch
  let success = true; // indicator if the commit dependencies could have been retrieved
  let result = []; //stores the number of lines each stakeholder owns
  let output; // variable to store the output of the shell command

  if (branchName) {

    if (!branchName.startsWith('origin')) {
      branchName = 'origin/' + branchName
    }
    try {
      // retrieve all files of the project at the specified commit
      output = execSync(`git ls-tree -r --name-only ${branchName}`).toString();

      // get all lines in array
      result = output.split('\n');

    } catch (e) {
      log('error in get-files.js: ', e)
      success = false;
    }
  }


  res.json({
    success: success,
    files: result
  });
};
