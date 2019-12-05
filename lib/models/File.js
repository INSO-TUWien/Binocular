'use strict';

const aql = require('arangojs').aql;
const Model = require('./Model.js');
const File = Model.define('File', { attributes: ['path', 'webUrl'] });

File.deduceMaxLengths = function() {
  const Hunk = require('./Hunk.js');
  return Promise.resolve(
    File.rawDb.query(
      aql`
      FOR file in ${File.collection}
      UPDATE file WITH {
        maxLength: MAX(
          FOR commit, edge
          IN OUTBOUND file ${Hunk.collection}
          RETURN edge.lineCount
        )
      } IN ${File.collection}
      `
    )
  );
};

File.findByPath = function(path) {
  return Promise.resolve(
    File.rawDb.query(
      aql`
      FOR file in ${File.collection}
      FILTER file.path == ${path}
      RETURN file
      `
    )
  ).then(file => {
    if (file._result.length > 0) {
      return this.parse(file._result[0]);
    }
    return null;
  });
};

module.exports = File;
