'use strict';

const _ = require('lodash');
const archiver = require('archiver');
const stream = require('stream');

module.exports = {
  createZipStream: function (directory) {
    const zip = archiver('zip');

    const pass = new stream.PassThrough();
    zip.pipe(pass);

    zip.directory(directory, false);
    zip.finalize();

    return pass;
  },

  renamer: function (mappings) {
    return function (obj) {
      const ret = {};
      _.each(mappings, function (to, from) {
        if (from in obj) {
          ret[to] = obj[from];
        }
      });

      return ret;
    };
  },

  getDbExport: async function (db) {
    const exportJson = {};
    const collections = await db.collections();
    for (const collection of collections) {
      const name = collection._name;
      exportJson[name] = await (await db.query('FOR i IN @@collection RETURN i', { '@collection': name })).all();
    }

    return exportJson;
  },
};
