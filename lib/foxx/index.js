'use strict';

const rp = require('request-promise');
const cfg = require('../config.js').get();
const fs = require('fs');
const archiver = require('archiver');
const temp = require('temp').track();

const BASE_URL = `http://${cfg.arango.host}:${cfg.arango.port}/_db/pupil`;
const UPLOAD_URL = `${BASE_URL}/_api/upload`;
const REPLACE_URL = `${BASE_URL}/_admin/foxx/replace`;

const auth = {
  user: cfg.arango.user,
  pass: cfg.arango.password
};

module.exports = {
  replace: function(serviceDir, mountPoint) {
    return uploadDirectoryAsZip(serviceDir).then(function(resp) {
      return rp.post(REPLACE_URL, {
        auth,
        body: {
          appInfo: resp.filename,
          mount: mountPoint
        },
        json: true
      });
    });
  }
};

function uploadDirectoryAsZip(dirPath) {
  const archive = archiver('zip', {
    store: true
  });

  archive.glob('**/*', { cwd: dirPath });
  archive.finalize();

  const tempPath = temp.path({ suffix: '.zip' });
  const output = fs.createWriteStream(tempPath);
  archive.pipe(output);

  return new Promise(function(resolve, reject) {
    output.on('close', resolve);
    output.on('error', reject);
    archive.on('error', reject);
  }).then(function() {
    return rp.post(UPLOAD_URL, {
      auth,
      formData: {
        file: fs.createReadStream(tempPath)
      },
      json: true
    });
  });
}
