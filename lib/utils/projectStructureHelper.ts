'use strict';

import fs from 'fs';
import * as utils from './utils';
import Moment from 'moment';
import log_timestamp from 'log-timestamp';
import path from 'path';
import { fileURLToPath } from 'url';
import Context from './context';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
log_timestamp(() => '[' + Moment().format('DD-MM-YYYY, HH:mm:ss') + ']');

export function checkProjectStructureAndFix(context: typeof Context) {
  //check if db_export folder exists

  if (context.argv.export && !fs.existsSync(__dirname + '/../../ui/db_export')) {
    this.createAndFillDbExportFolder(context);
  }
}

export function createAndFillDbExportFolder(context: typeof Context) {
  fs.mkdirSync(__dirname + '/../../ui/db_export');
  utils.getDbExport(context.db).then((db) => {
    let i = 0;
    for (const collection of Object.keys(db)) {
      fs.writeFileSync(__dirname + '/../../ui/db_export/' + collection.replaceAll('_', '-') + '.json', JSON.stringify(db[collection]));
      i++;
      console.log('Create Db export for offline execution: ' + Math.floor((100 / Object.keys(db).length) * i) + '%');
    }
  });
}

export function writeContextToFrontend(context: typeof Context) {
  async function getData(context: typeof Context) {
    const data: any = {};
    data.repo = { name: await context.repo.getName() };
    return data;
  }

  getData(context).then((data) => {
    fs.writeFileSync(__dirname + '/../../ui/config/context.json', JSON.stringify(data));
  });
}

export function deleteDbExport() {
  fs.rmSync(__dirname + '/../../ui/db_export', { recursive: true, force: true });
}
