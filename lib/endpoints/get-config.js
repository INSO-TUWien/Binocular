'use strict';

import _ from 'lodash';
import config from '../config';

export default function (req, res, context) {
  const cfg = _.clone(config.get());

  cfg.repoName = context.repo.getName();
  cfg.projectUrl = context.projectUrl;
  cfg.arango.webUrl = cfg.arango.webUrl || `http://${cfg.arango.host}:${cfg.arango.port}/`;

  res.json(cfg);
}
