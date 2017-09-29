'use strict';

const Promise = require('bluebird');
const rp = require('request-promise');

module.exports = function(req, res) {
  return Promise.try(() => {
    if (req.method === 'POST') {
      return rp('http://localhost:8529/_db/pupil-pupil/pupil-ql', {
        method: 'POST',
        body: req.body,
        json: true
      });
    } else if (req.method === 'GET') {
      return rp('http://localhost:8529/_db/pupil-pupil/pupil-ql', {
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
