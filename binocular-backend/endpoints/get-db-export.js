'use strict';

import * as utils from '../utils/utils.ts';

export default async function (req, res, context) {
  const cfg = await utils.getDbExport(context.db);

  res.json(cfg);
}
