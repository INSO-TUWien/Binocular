'use strict';

const _ = require('lodash');
const config = require('../config.js');
const ctx = require('../context.js');
const { aql } = require('arangojs');
const utils = require('../utils');

module.exports = async function (req, res) {
  const cfg = await utils.getDbExport();

  res.json(cfg);
};
