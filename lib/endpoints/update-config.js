'use strict';

import config from '../config.js';
import debug from 'debug';

const log = debug('srv');

export default function (req, res) {
  const data = req.body;

  log('Updating config', data);
  return config.update(data).then(function (config) {
    log('Wrote config');
    res.json(config);
  });
}
