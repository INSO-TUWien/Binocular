'use strict';

const Promise = require('bluebird');
const fetch = require('node-fetch');
const ctx = require('../context.js');
const config = require('../config.js');
const urlJoin = require('url-join');

module.exports = function (req, res) {
  const arangoHost = config.get('arango.host', 'localhost');
  const arangoPort = config.get('arango.port', '8529');
  const foxxUrl = `http://${arangoHost}:${arangoPort}/_db/binocular-${ctx.repo.getName()}/binocular-ql`;

  return Promise.try(() => {
    if (req.method === 'POST') {
      return fetch(foxxUrl, {
        method: 'POST',
        body: JSON.stringify(req.body),
      }).then((response) => {
        return response.json().then((data) => {
          return data;
        });
      });
    } else if (req.method === 'GET') {
      return fetch(foxxUrl, {
        auth: req.query,
      }).then((response) => {
        return response.json().then((data) => {
          return data;
        });
      });
    }
  })
    .then(function (resp) {
      res.json(resp);
    })
    .catch((err) => {
      console.log(err);
      res.status(err.statusCode).json({ errors: err.error.errors });
    });
};
