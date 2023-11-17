'use strict';

import fse from 'fs-extra';
import * as Db from './db.js';
export default function (config, context) {
  fse.ensureDirSync(context.repo.pathFromRoot('.binocular'));
  context.db = new Db.default(config.get().arango);
}
