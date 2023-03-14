'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');
const ctx = require('../context.js');
const config = require('../config.js');

module.exports = function (req, res) {
  const arangoHost = config.get('arango.host', 'localhost');
  const arangoPort = config.get('arango.port', '8529');
  const foxxUrl = `http://${arangoHost}:${arangoPort}/_db/pupil-${ctx.repo.getName()}/pupil-ql`;

  return Promise.try(() => {
    if (req.method === 'POST') {
      return rp(foxxUrl, {
        method: 'POST',
        body: req.body,
        json: true,
      });
    } else if (req.method === 'GET') {
      return rp(foxxUrl, {
        qs: req.query,
        json: true,
      });
    }
  })
    .then(function (resp) {
      res.json(resp);
    })
    .catch((err) => {
      console.log(err);
      res.json(err.statusCode, { errors: err.error.errors });
    });
};
