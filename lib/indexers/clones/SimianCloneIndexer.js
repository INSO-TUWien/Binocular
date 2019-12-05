'use strict';

const fs = require('fs');
const readline = require('readline');
const xml2js = require('xml2js');

const LastRevision = require('../../models/LastRevision.js');
const Clone = require('../../models/Clone.js');
const File = require('../../models/File.js');
const Commit = require('../../models/Commit.js');
const sh = require.resolve('../../../scripts/gather_clone_data_simian.sh');
const log = require('debug')('idx:clones:simian');
const Promise = require('bluebird');
const lastRevisionId = 'lastrevision';

const BaseCloneIndexer = require('../BaseCloneIndexer.js');

class SimianCloneIndexer extends BaseCloneIndexer {
  constructor() {
    super(...arguments);
  }

  index() {
    const self = this;
    if (self.enabled == 'true') {
      let repo = self.repoPath;
      let proj = self.project;
      let tool = self.toolexec;
      let clonedir = self.clonedir;
      let revfile = self.revfile;
      let params = repo + ' ' + proj + ' ' + tool + ' ' + clonedir + ' ' + revfile;
      var child_process = require('child_process');

      return Promise.resolve(LastRevision.findById(lastRevisionId))
        .then(function(instance) {
          if (instance) {
            params = params + ' ' + instance.sha;
          }
        })
        .then(() => {
          // if (process.platform === 'win32') {
          // starts a bash script that triggers the clone detector
          child_process.exec(sh + ' ' + params, function(error, stdout, stderr) {
            if (stderr) {
              throw new Error('Code Clone detection failed.');
            } else {
              log('Clone detection finished successfully');
              log('Starting XML parser and database import');
            }

            const readRevFileInterface = readline.createInterface({
              input: fs.createReadStream(revfile),
              output: null,
              console: false
            });

            let chain = Promise.resolve();
            readRevFileInterface.on('line', function(line) {
              chain = chain
                .then(() => self.indexClones(self, line))
                .then(() => self.saveLastIndexedRevision(line));
            });
          });
          // } else {
          //   child_process.exec(sh + ' ' + params, function(error, stdout, stderr) {
          //     console.log(stdout);
          //     console.log(stderr);

          //     log(stdout);
          //     log(stderr);
          //   });
          // }
          //return;
        });
    }
  }

  indexClones(self, line) {
    return new Promise(resolve => {
      let rev = line;
      var filename_type1 = self.clonedir + '/simian_' + line + '_type1.xml';
      var filename_type2 = self.clonedir + '/simian_' + line + '_type2.xml';
      console.log('indexClones1 START: ' + filename_type1);
      self.gatherClones(filename_type1, rev, 1, self.repoPath).then(() => {
        console.log('indexClones1 END: ' + filename_type1);
        console.log('indexClones2 START: ' + filename_type2);
        self.gatherClones(filename_type2, rev, 2, self.repoPath).then(() => {
          console.log('indexClones2 END: ' + filename_type2);
          resolve();
        });
      });
    });
  }

  saveLastIndexedRevision(rev) {
    return new Promise.resolve(LastRevision.findById(lastRevisionId)).then(function(instance) {
      if (instance) {
        instance.sha = rev;
      }
      instance.save();
    });
  }

  gatherClones(filename, rev, type, repo) {
    let xml_data = null;
    return new Promise(resolve => {
      if (!fs.existsSync(filename)) {
        resolve();
        return;
      }

      xml_data = fs.readFileSync(filename);

      if (xml_data != null) {
        var parser = new xml2js.Parser({ attrkey: 'ATTR' });
        console.log('gatherClones START: ' + rev);
        parser.parseString(xml_data, function(error, result) {
          var clonePromises = result.simian.check[0].set.map(function(clone) {
            console.log('gatherClones CLONE START: ' + clone.ATTR.fingerprint);
            return Clone.create({
              fingerprint: clone.ATTR.fingerprint,
              revision: rev,
              type: type,
              sourcecode: clone.text
            })
              .then(c => {
                Commit.findById(rev).then(commit => {
                  if (commit) {
                    c.connect(commit);
                  }
                });
                return c;
              })
              .then(c => {
                var filePromises = clone.block.map(function(block) {
                  console.log('gatherClones FILE START: ' + block.ATTR.sourceFile);
                  return File.findByPath(
                    block.ATTR.sourceFile
                      .substr(repo.length, block.ATTR.sourceFile.length)
                      .split('\\')
                      .join('/')
                  )
                    .then(file => {
                      if (file) {
                        c.connect(file, {
                          startline: block.ATTR.startLineNumber,
                          endline: block.ATTR.endLineNumber,
                          path: file.path,
                          revision: rev
                        });
                      }
                    })
                    .then(() => {
                      console.log('gatherClones FILE END: ' + block.ATTR.sourceFile);
                    });
                });
                Promise.all(filePromises).then(function() {
                  console.log('gatherClones CLONE END: ' + clone.ATTR.fingerprint);
                });
              });
          });
          Promise.all(clonePromises).then(function() {
            console.log('gatherClones END');
            resolve();
            return;
          });
        });
      }
    });
  }
}

module.exports = SimianCloneIndexer;
