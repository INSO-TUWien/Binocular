'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Branch',
  description: 'A branch in the git-repository',
  fields() {
    return {
      id: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
        resolve: (e) => e._key,
      },
      branch: {
        type: gql.GraphQLString,
        description: 'The name of the branch',
      },
      active: {
        type: gql.GraphQLString,
        description: 'True if this is the current active branch on your system.',
      },
      latestCommit: {
        type: gql.GraphQLString,
        description: 'latest commit on this branch',
      },
    };
  },
});
