'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Stats',
  description: 'holds stats of sprints',
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
