'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Ownership',
  description: 'how many lines of a file does a stakeholder own at the time of a commit',
  fields() {
    return {
      stakeholder: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
      },
      ownedLines: {
        type: new gql.GraphQLNonNull(gql.GraphQLInt),
      },
    };
  },
});
