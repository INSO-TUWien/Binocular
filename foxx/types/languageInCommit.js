'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'LanguagesInCommit',
  description: 'A language used in a single commit',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      language: {
        type: require('./language.js')
      },
      lineCount: {
        type: gql.GraphQLInt,
        description: 'The number of lines in this file at this commit'
      },
      stats: {
        type: require('./stats'),
        description: 'The changing stats of the commit'
      }
    };
  }
});
