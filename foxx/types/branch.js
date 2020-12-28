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
      headShas: {
        type: new gql.GraphQLList(
          new gql.GraphQLObjectType({
            name: 'HeadShas',
            fields: {
              project: {
                type: gql.GraphQLString,
              },
              headSha: {
                type: gql.GraphQLString,
              },
            },
          })
        ),
        description: 'Project-specific headShas of the branch',
      },
    };
  },
});
