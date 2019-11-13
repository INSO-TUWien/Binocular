'use strict';

const sh = require.resolve('../../../scripts/gather_clone_data_simian.sh');
const log = require('debug')('idx:clones:simian');

const BaseCloneIndexer = require('../BaseCloneIndexer.js');

class SimianCloneIndexer extends BaseCloneIndexer {
  constructor() {
    super(...arguments);
  }

  index() {
    var child_process = require('child_process');
    const params = this.repo_path + ' ' + this.project + ' ' + this.toolexec;

    if (process.platform === 'win32') {
      child_process.exec(sh + ' ' + params, function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        log(stdout);
        log(stderr);
      });
    } else {
      child_process.exec(sh + ' ' + params, function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        log(stdout);
        log(stderr);
      });
    }

    return;
  }
}

module.exports = SimianCloneIndexer;
