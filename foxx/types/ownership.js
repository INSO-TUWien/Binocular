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
      hunks: {
        type: new gql.GraphQLList(OwnershipHunk),
      },
    };
  },
});



const OwnershipHunk = new gql.GraphQLObjectType({
  name: 'OwnershipHunk',
  description: '',
  fields() {
    return {
      startLine: {
        type: new gql.GraphQLNonNull(gql.GraphQLInt),
      },
      endLine: {
        type: new gql.GraphQLNonNull(gql.GraphQLInt),
      },
      commitSha: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
      },
    }
  }
})
