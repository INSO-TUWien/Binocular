'use strict';

const config = require('../config.js');

module.exports = function(req, res) {
  const cfg = config.get();
  res.json(cfg);
};
