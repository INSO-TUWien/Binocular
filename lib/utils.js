'use strict';

const _ = require('lodash');
const archiver = require('archiver');
const stream = require('stream');

module.exports = {
  createZipStream: function(directory) {
    const zip = archiver('zip');

    const pass = new stream.PassThrough();
    zip.pipe(pass);

    zip.directory(directory, false);
    zip.finalize();

    return pass;
  },

  renamer: function(mappings) {
    return function(obj) {
      const ret = {};
      _.each(mappings, function(to, from) {
        if (from in obj) {
          ret[to] = obj[from];
        }
      });

      return ret;
    };
  }
};
