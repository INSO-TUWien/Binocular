'use strict';

import * as path from 'path';
import * as fastText from 'fasttext';

const model = path.resolve(__dirname, '../utils/model.bin');
const classifier = new fastText.Classifier(model);

export default async function (req, res, context) {
  if (!req.query.commitMessage) {
    res.sendStatus(400);
  }
  res.send(JSON.stringify(await classifier.predict('' + req.query.commitMessage,5)))
}
