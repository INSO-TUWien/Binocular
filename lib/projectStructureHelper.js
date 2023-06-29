'use strict';

const _ = require('lodash');
const ctx = require('./context');
const fs = require('fs');
const utils = require('./utils');
const Moment = require('moment/moment');
require('log-timestamp')(() => '[' + Moment().format('DD-MM-YYYY, HH:mm:ss') + ']');

module.exports = {
  checkProjectStructureAndFix: function () {
    //check if db_export folder exists
    if (!fs.existsSync(__dirname + '/../ui/db_export')) {
      this.createAndFillDbExportFolder();
    }
  },
  createAndFillDbExportFolder: function () {
    fs.mkdirSync(__dirname + '/../ui/db_export');
    utils.getDbExport().then((db) => {
      let i = 0;
      for (const collection of Object.keys(db)) {
        fs.writeFileSync(__dirname + '/../ui/db_export/' + collection.replaceAll('_', '-') + '.json', JSON.stringify(db[collection]));
        i++;
        console.log('Create Db export for offline execution: ' + Math.floor((100 / Object.keys(db).length) * i) + '%');
      }
    });
  },
  writeContextToFrontend: function (context) {
    async function getData(context) {
      const data = {};
      data.repo = { name: await context.repo.getName() };
      return data;
    }

    getData(context).then((data) => {
      fs.writeFileSync(__dirname + '/../ui/config/context.json', JSON.stringify(data));
    });
  },
};
