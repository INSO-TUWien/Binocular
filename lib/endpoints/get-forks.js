'use strict';

const log = require('debug')('srv');
const ctx = require('../context.js');
const utils = require('../utils.js');

// TODO: add logs + get parent
module.exports = function (req, res) {
  const octokit = utils.getOctokit();
  const repo = ctx.repo;

  utils
    .getGithubOwnerAndRepo(repo)

    // get all forks from the base project
    .then((match) => {
      const owner = match[1];
      const repo = match[2];

      return octokit.paginate(octokit.repos.listForks, {
        owner,
        repo,
      });
    })

    // filter relevant information to reduce traffic and send it back via the response
    .then((forks) => {
      const forkList = [];
      forks.forEach((fork) => {
        forkList.push({
          fullName: fork.full_name,
          name: fork.name,
          ownerName: fork.owner.login,
        });
      });
      res.json({
        forks: forkList,
        parent: undefined,
      });
    });
};
