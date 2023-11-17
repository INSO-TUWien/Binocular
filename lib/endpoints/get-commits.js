'use strict';

import _ from 'lodash';

export default function (req, res, context) {
  const Commit = context.models.Commit;
  const File = context.models.File;
  const BlameHunk = context.models.BlameHunk;

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
}
