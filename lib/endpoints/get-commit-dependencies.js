'use strict';

const log = require('debug')('srv');
const { execSync } = require('child_process');

module.exports = function (req, res) {
  const sha = req.body.sha; // the sha from which commit the commit dependencies should be retrieved
  let commitDependencyShas = []; // list of shas the requested commit (sha) depends on
  let success = true; // indicator if the commit dependencies could have been retrieved
  let output; // variable to store the output of the shell command

  try {
    // retrieve the direct commit dependencies using git-deps (not recursive, only first level)
    output = execSync(`git deps ${sha}^!`).toString();

    // git-deps will write the shas of the commit dependencies in separate rows
    // -> split the output on each new line to get all the shas the requested commit depends on
    commitDependencyShas = output.split('\n');
  } catch (e) {
    // git deps was unable to retrieve the commits
    log(e.toString());
    success = false;
  }

  res.json({
    commitDependencies: {
      success,
      sha,
      commitDependencyShas,
    },
  });
};
