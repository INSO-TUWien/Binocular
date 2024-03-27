'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'CommitInFile',
  description: 'A commit that mentions a single file',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      hunks: {
        type: new gql.GraphQLList(require('./hunk.js')),
        description: 'The hunks that affect this file',
      },
      commit: {
        type: require('./commit.js'),
      },
    };
  },
});