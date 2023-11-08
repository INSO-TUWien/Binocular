'use strict';

import ctx from '../context.js';
import * as utils from '../utils.ts';

export default async function (req, res) {
  const cfg = await utils.getDbExport(ctx.db);

  res.json(cfg);
}
