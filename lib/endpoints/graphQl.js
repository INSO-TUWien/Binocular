'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');
const ctx = require('../context.js');

module.exports = function(req, res) {
  const foxxUrl = `http://localhost:8529/_db/pupil-${ctx.repo.getName()}/pupil-ql`;

  return Promise.try(() => {
    if (req.method === 'POST') {
      return rp(foxxUrl, {
        method: 'POST',
        body: req.body,
        json: true
      });
    } else if (req.method === 'GET') {
      return rp(foxxUrl, {
        qs: req.query,
        json: true
      });
    }
  })
    .then(function(resp) {
      res.json(resp);
    })
    .catch(err => {
      console.log(err);
      res.json(err.statusCode, { errors: err.error.errors });
    });
};
