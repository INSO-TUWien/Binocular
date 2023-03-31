'use strict';

const rp = require('request-promise');
const ctx = require('../context.js');
const config = require('../config.js');

module.exports = function (req, res) {
  const arangoHost = config.get('arango.host', 'localhost');
  const arangoPort = config.get('arango.port', '8529');
  const foxxUrl = `http://${arangoHost}:${arangoPort}/_db/binocular-${ctx.repo.getName()}/binocular-ql`;
  if (req.method === 'POST') {
    return Promise.resolve(
      rp(foxxUrl, {
        method: 'POST',
        body: req.body,
        json: true,
      })
    )
      .then(function (resp) {
        res.json(resp);
      })
      .catch((err) => {
        console.log(err);
        res.status(err.statusCode).json({ errors: err.error.errors });
      });
  } else if (req.method === 'GET') {
    return Promise.resolve(
      rp(foxxUrl, {
        qs: req.query,
        json: true,
      })
    )
      .then(function (resp) {
        res.json(resp);
      })
      .catch((err) => {
        console.log(err);
        res.status(err.statusCode).json({ errors: err.error.errors });
      });
  }
};
