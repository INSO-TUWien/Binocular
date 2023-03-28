'use strict';

const _ = require('lodash');
const { models } = require('../context.js');

module.exports = function (req, res) {
  const Commit = models.Commit;
  const File = models.File;
  const BlameHunk = models.BlameHunk;

  return Commit.findAll({
    order: ['date'],
    include: [
      {
        model: BlameHunk,
        include: [File],
      },
    ],
  })
    .map(function (commit) {
      const ret = _.omit(commit.toJSON(), 'BlameHunks');
      ret.files = _(commit.BlameHunks)
        .groupBy((h) => _.get(h, 'File.path'))
        .mapValues((fs) => _.map(fs, (f) => _.pick(f, 'startLine', 'lineCount', 'signature')));

      return ret;
    })
    .then(function (result) {
      res.json(result);
    });
};
