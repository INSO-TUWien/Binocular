'use strict';

const log = require('debug')('srv');
const config = require('../config.js');

module.exports = function(req, res) {
  const data = req.body;

  log('Updating config', data);
  return config.update(data).then(function(config) {
    log('Wrote config');
    res.json(config);
  });
};
