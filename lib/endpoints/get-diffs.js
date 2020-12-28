'use strict';

const log = require('debug')('srv');
const ctx = require('../context.js');
const Git = require('nodegit');
const Promise = require('bluebird');

module.exports = function (req, res) {
  const commitSha = req.body.sha;
  const repo = ctx.repo.repo;

  return Git.Commit.lookup(repo, commitSha)
    .then((commit) => {
      return commit.getDiff();
    })
    .then((diffArray) => {
      const diffPatches = [];
      diffArray.forEach((diff) => diffPatches.push(diff.toBuf(Git.Diff.FORMAT.PATCH)));
      return Promise.all(diffPatches);
    })
    .then((diffs) => {
      let longDiff = '';
      diffs.forEach((diff) => (longDiff = `${longDiff}\n${diff}`));
      res.json({ longDiff });
    });
};
