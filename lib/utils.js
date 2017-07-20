'use strict';

const path = require('path');
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
  }
};
