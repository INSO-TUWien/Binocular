'use strict';

const config = require('../config.js');

module.exports = function(req, res) {
  const data = req.body;

  return config.update(data).then(function(config) {
    res.json(config);
  });
};
