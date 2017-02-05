'use strict';

const ctx = require( '../context.js' );

const _ = require( 'lodash' );
const Sequelize = ctx.sequelize.Sequelize;
const User = require( './User.js' );

const Issue = ctx.sequelize.define( 'Issue', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  iid: Sequelize.INTEGER,
  title: Sequelize.STRING,
  description: Sequelize.STRING,
  state: Sequelize.ENUM( 'closed', 'open' ),
  gitlabAuthorId: Sequelize.INTEGER,
  authorName: Sequelize.STRING,
  url: Sequelize.STRING
}, {
  classMethods: {
    persist: function( issueData ) {
      
      return Issue.findById( issueData.id )
      .then( function( issue ) {
        if( !issue ) {
          // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
          const data = _.pick( issueData, 'id', 'iid', 'title', 'description', 'state' );
          _.merge( data, { authorName: issueData.author.name, url: issueData.web_url } );

          return Issue.create( data )
          .then( issue => [issue, true] );
        } else {
          return [issue, false];
        }
      } );
    },

    /**
     * Assign users to all issues that do not already have users assigned. If a user with a matching gitlabUserId
     * is not found, matching another user by name will be tried. If that also fails, no user is assigned.
     **/
    deduceUsers: function() {

      return Issue.findAll( {
        where: { AuthorId: null }
      } )
      .map( function( issue ) {

        return User.findOne( {
          where: { gitlabId: issue.gitlabAuthorId }
        } )
        .then( function( user ) {
          if( !user ) {
            return findBestUserMatch( issue );
          }

          return user;
        } )
        .then( function( user ) {
          if( user ) {
            return issue.update( { AuthorId: user.id } );
          }
            
          return issue;
        } );
        
      } );
    }

  }
} );

Issue.belongsTo( User, { as: 'Author' } );
User.hasMany( Issue, { foreignKey: 'AuthorId' } );

module.exports = Issue;

function findBestUserMatch( issue ) {
  return User.findAll()
  .reduce( function( best, user ) {

    const userName = normalizeName( user.gitSignature );
    const authorName = normalizeName( issue.authorName );
    let score = 0;

    if( userName.plain === authorName.plain ) {
      score++;
    }

    if( userName.sorted === authorName.sorted ) {
      score++;
    }

    if( !best || score > best.score ) {
      return { score, user };
    } else if( score > 0 ) {
      return best;
    }

  }, null )
  .then( function( bestMatch ) {
    return bestMatch ? bestMatch.user : null;
  } );
}

function normalizeName( name ) {
  const plain = _.chain( name ).deburr().lowerCase().trim().value();
  const sorted = _.chain( plain ).split( /\s+/ ).sort().join( ' ' ).value();

  return { plain, sorted };
}
