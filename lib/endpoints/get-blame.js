'use strict';

const Promise = require('bluebird');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const log = require('debug')('getblame');

module.exports = function (req, res) {
  const sha = req.body.sha; // the sha from which commit the blame should be retrieved
  const files = req.body.files; //files for which git blame should be executed
  let success = true; // indicator if the commit dependencies could have been retrieved
  const result = {}; //stores the number of lines each stakeholder owns

  Promise.all(
    files.map(async (file) => {
      try {
        const { stdout, _ } = await exec(`git blame -e ${sha} -- ${file}`, { maxBuffer: 1024 * 5000 });
        return stdout;
      } catch (e) {
        log('error in get-blame.js: ', e);
        success = false;
        return '';
      }
    })
  )
    .then((outputArray) => {

      for (const output of outputArray) {

        // get all lines in array
        const lines = output.split('\n');

        for (const line of lines) {
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
    .then((_) => {
      res.json({
        success: success,
        blame: result,
      });
    });
};
