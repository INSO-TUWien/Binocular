'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'CommitInFile',
  description: 'A commit that touches a file',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      commit: {
        type: require('./commit.js'),
      },
      ownership: {
        type: new gql.GraphQLList(require('./ownership.js')),
      },
    };
  },
});
