'use strict';

const ctx = require('../context.js');
const utils = require('../utils.js');
const Promise = require('bluebird');

module.exports = function (req, res) {
  const octokit = utils.getOctokit();
  const repo = ctx.repo;

  utils
    .getGithubOwnerAndRepo(repo)

    // get all forks and the parent (if existing) from the base project
    .then((match) => {
      const owner = match[1];
      const repo = match[2];

      // get infos about the project
      return Promise.join(
        // forks
        octokit.paginate(octokit.repos.listForks, {
          owner,
          repo,
        }),
        // repo info including information if this repo is a fork and whats its parent
        octokit.repos.get({
          owner,
          repo,
        })
      );
    })

    // filter relevant information to reduce traffic and send it back via the response
    .then(([forks, repo]) => {
      // get forks
      const forkList = [];
      forks.forEach((fork) => {
        forkList.push({
          fullName: fork.full_name,
          name: fork.name,
          ownerName: fork.owner.login,
        });
      });

      // get parent
      let parent;
      // repo is a fork -> extract parent information
      if (repo.data.fork) {
        parent = {
          fullName: repo.data.parent.full_name,
          name: repo.data.parent.name,
          ownerName: repo.data.parent.owner.login,
        };
      }

      res.json({
        forks: forkList,
        parent: parent,
      });
    });
};
