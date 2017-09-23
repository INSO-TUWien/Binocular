'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'FileInCommit',
  description: 'A file touched by a single commit',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: e => e._key
      },
      file: {
        type: require('./file.js')
      },
      lineCount: {
        type: gql.GraphQLInt,
        description: 'The number of lines in this file at this commit'
      },
      hunks: {
        type: new gql.GraphQLList(require('./hunk.js')),
        description: 'The hunks that affect this file'
      }
    };
  }
});
