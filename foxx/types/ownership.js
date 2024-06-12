'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'Ownership',
  description: 'how many lines of a file does a user own at the time of a commit',
  fields() {
    return {
      user: {
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
      originalCommit: {
        type: new gql.GraphQLNonNull(gql.GraphQLString),
      },
      lines: {
        type: new gql.GraphQLList(OwnershipHunkLines)
      }
    }
  }
})

const OwnershipHunkLines = new gql.GraphQLObjectType({
  name: 'OwnershipHunkLines',
  description: '',
  fields() {
    return {
      from: {
        type: new gql.GraphQLNonNull(gql.GraphQLInt)
      },
      to: {
        type: new gql.GraphQLNonNull(gql.GraphQLInt)
      },
    }
  }
})
