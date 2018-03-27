'use strict';

const aql = require('arangojs').aql;
const Model = require('./Model.js');
const BlameHunk = Model.define('BlameHunk', {
  attributes: ['startLine', 'lineCount', 'signature']
});

BlameHunk.deduceStakeholders = function() {
  const BlameHunkStakeholderConnection = require('./BlameHunkStakeholderConnection.js');
  const Stakeholder = require('./Stakeholder.js');

  // walk through all hunks
  return Promise.resolve(
    BlameHunk.rawDb.query(
      aql`
    FOR hunk IN ${BlameHunk.collection}
        LET stakeholders = (FOR stakeholder
                    IN
                    INBOUND hunk ${BlameHunkStakeholderConnection.collection}
                        RETURN stakeholder)
        FILTER LENGTH(stakeholders) == 0
        COLLECT sig = hunk.signature INTO hunksPerSignature = hunk
        RETURN {
          "signature": sig,
          "hunks": hunksPerSignature
        }`
    )
  )
    .then(cursor => cursor.all())
    .each(function(signature) {
      // try to get an already existing stakeholder with that signature
      return Stakeholder.ensureByGitSignature(signature.signature).spread(function(stakeholder) {
        // walk over all hunks with that signature
        return Promise.map(signature.hunks, function(rawHunk) {
          // assign the hunk to the stakeholder
          return BlameHunk.parse(rawHunk).connect(stakeholder);
        });
      });
    });
};

module.exports = BlameHunk;
