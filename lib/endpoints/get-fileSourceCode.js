'use strict';

import path from 'path';
import fs from 'fs';

export default function (req, res) {
  return fs.readFile(path.join(process.cwd(), req.body.path), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.json({ sourceCode: 'Could not read Source Code!' });
      return;
    }
    console.log(data);
    res.json({ sourceCode: data });
  });
  //return res.json({ sourceCode: fs.readFile(path.join(process.cwd(), req.body.path)) });
}
