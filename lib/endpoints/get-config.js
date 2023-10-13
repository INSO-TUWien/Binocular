'use strict';

import _ from 'lodash';
import config from '../config.js';
import ctx from '../context.js';

export default function (req, res) {
  const cfg = _.clone(config.get());

  cfg.repoName = ctx.repo.getName();
  cfg.projectUrl = ctx.projectUrl;
  cfg.arango.webUrl = cfg.arango.webUrl || `http://${cfg.arango.host}:${cfg.arango.port}/`;

  res.json(cfg);
}
