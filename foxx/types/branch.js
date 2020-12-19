'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Branch',
  description: 'A single branch with its head commit',
  fields() {
    return {
      branchKey: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      branchName: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The name of the branch',
      },
      headSha: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        description: 'The sha of the branches head',
      },
    };
  },
});
