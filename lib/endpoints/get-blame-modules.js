'use strict';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const log = require('debug')('getblame');

//cache blame results
const cache = {};

module.exports = function (req, res) {
  const sha = req.body.sha; // the sha from which commit the blame should be retrieved
  const files = req.body.files; //files for which git blame should be executed
  let success = true; // indicator if the commit blames could have been retrieved
  const result = {}; //stores the number of lines each stakeholder owns

  //use promise.all for parallel execution
  Promise.all(
    files.map(async (file) => {
      //if there is an entry in the cache object, add it to the result object
      if (cache[`${sha}_${file}`]) {
        const cachedObj = cache[`${sha}_${file}`];
        Object.entries(cachedObj).map((item) => {
          const mail = item[0];
          const count = item[1];
          if (result[mail]) {
            result[mail] = result[mail] + count;
          } else {
            result[mail] = count;
          }
        });
        return [];
      }

      //if this file/sha combination is not chached yet, run a cli command
      try {
        const { stdout, _ } = await exec(`git blame -e ${sha} -- ${file}`, { maxBuffer: 1024 * 10000 });
        return [file, stdout];
      } catch (e) {
        log('error in get-blame.js: ', e);
        success = false;
        return '';
      }
    })
  )
    .then((outputArray) => {
      //if the array is empty, it means that it was a cache hit in the previous step. Skip this file
      for (const tuple of outputArray) {
        if (tuple.length === 0) {
          continue;
        }

        //if the array was not empty, calculate the result, cache it and add it to the result object
        const fileName = tuple[0];
        const output = tuple[1];
        const fileCache = {};

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

              if (fileCache[mail]) {
                fileCache[mail] = fileCache[mail] + 1;
              } else {
                fileCache[mail] = 1;
              }
            }
          }
        }

        //cache the temp result for later use
        cache[`${sha}_${fileName}`] = fileCache;
      }
    })
    .then(() => {
      res.json({
        success: success,
        blame: result,
      });
    });
};
