'use strict';

const LastRevision = require('../../models/LastRevision.js');
const sh = require.resolve('../../../scripts/gather_clone_data_simian.sh');
const log = require('debug')('idx:clones:simian');
const Promise = require('bluebird');

const BaseCloneIndexer = require('../BaseCloneIndexer.js');

class SimianCloneIndexer extends BaseCloneIndexer {
  constructor() {
    super(...arguments);
  }

  index() {
    let repo = this.repoPath;
    let proj = this.project;
    let tool = this.toolexec;

    var child_process = require('child_process');
    let params = repo + ' ' + proj + ' ' + ' ' + tool;

    const lastRevisionId = 'lastrevision';

    return Promise.resolve(LastRevision.findById(lastRevisionId))
      .then(function(instance) {
        if (instance) {
          params = params + ' ' + instance.sha;
        }
      })
      .then(() => {
        // if (process.platform === 'win32') {
        // starts as bash script
        child_process.exec(sh + ' ' + params, function(error, stdout, stderr) {
          console.log(stdout);
          console.log(stderr);

          log(stdout);
          log(stderr);

          if (stderr) {
            throw new Error('Code Clone detection failed.');
          }
        });
        // } else {
        //   child_process.exec(sh + ' ' + params, function(error, stdout, stderr) {
        //     console.log(stdout);
        //     console.log(stderr);

        //     log(stdout);
        //     log(stderr);
        //   });
        // }
        return;
      });
  }
}

module.exports = SimianCloneIndexer;
