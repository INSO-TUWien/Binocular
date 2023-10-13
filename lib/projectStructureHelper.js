'use strict';

import ctx from './context.js';
import fs from 'fs';
import * as utils from './utils.js';
import Moment from 'moment';
import path from 'path';
import { fileURLToPath } from 'url';
import log_timestamp from 'log-timestamp';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
log_timestamp(() => '[' + Moment().format('DD-MM-YYYY, HH:mm:ss') + ']');

export function checkProjectStructureAndFix() {
  //check if db_export folder exists
  if (!fs.existsSync(__dirname + '/../ui/db_export')) {
    this.createAndFillDbExportFolder();
  }
}

export function createAndFillDbExportFolder() {
  fs.mkdirSync(__dirname + '/../ui/db_export');
  utils.getDbExport(ctx.db).then((db) => {
    let i = 0;
    for (const collection of Object.keys(db)) {
      fs.writeFileSync(__dirname + '/../ui/db_export/' + collection.replaceAll('_', '-') + '.json', JSON.stringify(db[collection]));
      i++;
      console.log('Create Db export for offline execution: ' + Math.floor((100 / Object.keys(db).length) * i) + '%');
    }
  });
}

export function writeContextToFrontend(context) {
  async function getData(context) {
    const data = {};
    data.repo = { name: await context.repo.getName() };
    return data;
  }

  getData(context).then((data) => {
    fs.writeFileSync(__dirname + '/../ui/config/context.json', JSON.stringify(data));
  });
}
