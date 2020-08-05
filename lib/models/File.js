'use strict';

const aql = require('arangojs').aql;
const Model = require('./Model.js');
const Promise = require('bluebird');
const File = Model.define('File', { attributes: ['path', 'webUrl', 'language'] });

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

File.deduceLanguage = function() {
  const Hunk = require('./Hunk.js');
  return Promise.resolve(
    File.rawDb.query(
      aql`
      FOR file in ${File.collection}
      let hunks = (FOR commit, edge
          IN OUTBOUND file ${Hunk.collection}
          FILTER edge.hunks AND LENGTH(edge.hunks) > 0
          RETURN edge.hunks
        )
      FILTER hunks AND LENGTH(hunks) > 0
      RETURN {
        path: file.path,
        hunks,
        length: LENGTH(hunks)
      }
      `
    )
  );
};

module.exports = File;
