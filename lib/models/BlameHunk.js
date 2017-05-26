'use strict';

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
      return Stakeholder.ensureByGitSignature(signature.signature).then(function(stakeholder) {
        // walk over all hunks with that signature
        return Promise.map(signature.hunks, function(rawHunk) {
          // assign the hunk to the stakeholder
          return BlameHunk.parse(rawHunk).connect(stakeholder);
        });
      });
    });
};

module.exports = BlameHunk;

// 'use strict';

// const ctx = require( '../context.js' );

// const Sequelize = ctx.sequelize.Sequelize;
// const File = require( './File.js' );
// const User = require( './User.js' );
// const Commit = require( './Commit.js' );

// const BlameHunk = ctx.sequelize.define( 'BlameHunk', {
//   id: {
//     type: Sequelize.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//     allowNull: false
//   },
//   startLine: Sequelize.INTEGER,
//   lineCount: Sequelize.INTEGER,
//   signature: Sequelize.STRING
// }, {
//   timestamps: false,
//   classMethods: {
//     deduceUsers: function() {
//       return User.findAll()
//       .map( function( user ) {
//         return BlameHunk.update( { AuthorId: user.id }, {
//           where: {
//             signature: user.gitSignature
//           }
//         } );
//       } );
//     }
//   }
// } );

// BlameHunk.belongsTo( File );
// File.hasMany( BlameHunk );

// BlameHunk.belongsTo( Commit );
// Commit.hasMany( BlameHunk );

// File.belongsToMany( Commit, { through: BlameHunk } );
// Commit.belongsToMany( File, { through: BlameHunk } );

// BlameHunk.belongsTo( User, { as: 'Author' } );
// User.hasMany( BlameHunk, { foreignKey: 'AuthorId' } );

// module.exports = BlameHunk;
