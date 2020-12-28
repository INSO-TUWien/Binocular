'use strict';

const _ = require('lodash');
const config = require('../config.js');
const ctx = require('../context.js');

module.exports = function(req, res) {
  const cfg = _.clone(config.get());

  cfg.repoName = ctx.repo.getName();
  cfg.repoOwner = ctx.repo.getOwner(); // add owner, needed for multi project storage in the DB
  cfg.projectUrl = ctx.projectUrl;
  cfg.arango.webUrl = cfg.arango.webUrl || `http://${cfg.arango.host}:${cfg.arango.port}/`;

  res.json(cfg);
};
