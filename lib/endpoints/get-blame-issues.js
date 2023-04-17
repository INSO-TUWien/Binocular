'use strict';

const Promise = require('bluebird');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const log = require('debug')('getblame');

module.exports = function (req, res) {
  const sha = req.body.sha; // the sha from which commit the blame should be retrieved
  const files = req.body.files; //files for which git blame should be executed
  const issueHashes = req.body.hashes; //all sha hashes of commits that belong to the currently selected issue
  let success = true; // indicator if the commit blames could have been retrieved
  const result = {}; //stores the number of lines each stakeholder owns

  //use promise.all for parallel execution
  Promise.all(
    files.map(async (file) => {
      //if this file/sha combination is not chached yet, run a cli command
      try {
        const { stdout, _ } = await exec(`git blame -e -l ${sha} -- ${file}`, { maxBuffer: 1024 * 10000 });
        return stdout;
      } catch (e) {
        log('error in get-blame.js: ', e);
        success = false;
        return '';
      }
    })
  )
    .then((outputArray) => {
      //if the array is empty, it means that it was a cache hit in the previous step. Skip this file
      for (const output of outputArray) {
        // get all lines in array
        const lines = output.split('\n');

        for (const line of lines) {
          //check if the line is from one of the commits related to the currently selected issue (one of the commits from hashes)
          //if not, skip this line
          let lineSha = line.split(' ');
          if (lineSha.length > 1) {
            lineSha = lineSha[0];
            if (!issueHashes.includes(lineSha)) {
              continue;
            }
          }

          let mailTemp = line.split('<');

          if (mailTemp.length > 1) {
            mailTemp = mailTemp[1].split('>');
            if (mailTemp.length > 0) {
              const mail = mailTemp[0];

              if (result[mail]) {
                result[mail] = result[mail] + 1;
              } else {
                result[mail] = 1;
              }
            }
          }
        }
      }
    })
    .then(() => {
      res.json({
        success: success,
        blame: result,
      });
    });
};
