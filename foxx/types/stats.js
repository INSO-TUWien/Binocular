'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Stats',
  description: 'holds stats of changes',
  fields() {
    return {
      additions: {
        type: gql.GraphQLInt,
        description: 'count of added LoCs',
      },
      deletions: {
        type: gql.GraphQLInt,
        description: 'count of removed LoCs',
      },
    };
  },
});
