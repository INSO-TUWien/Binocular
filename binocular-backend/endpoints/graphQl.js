'use strict';

import fetch from 'node-fetch';
import config from '../utils/config.js';

export default function (req, res, context) {
  const arangoHost = config.get('arango.host', 'localhost');
  const arangoPort = config.get('arango.port', '8529');
  const foxxUrl = `http://${arangoHost}:${arangoPort}/_db/binocular-${context.repo.getName()}/binocular-ql`;

  if (req.method === 'POST') {
    fetch(foxxUrl, {
      method: 'POST',
      body: JSON.stringify(req.body),
    }).then((response) => {
      response
        .json()
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          console.log(err);
          res.status(err.statusCode).json({ errors: err.error.errors });
        });
    });
  } else if (req.method === 'GET') {
    fetch(foxxUrl, {
      auth: req.query,
    }).then((response) => {
      response
        .json()
        .then((data) => {
          res.json(data);
        })
        .catch((err) => {
          console.log(err);
          res.status(err.statusCode).json({ errors: err.error.errors });
        });
    });
  }
}
