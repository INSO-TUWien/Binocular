'use strict';

import fse from 'fs-extra';
import ctx from '../../context.ts';
import conf from '../../config';
import * as Db from './db.js';
const config = conf.get();
export default function () {
  fse.ensureDirSync(ctx.repo.pathFromRoot('.binocular'));
  ctx.db = new Db.default(config.arango);
}
