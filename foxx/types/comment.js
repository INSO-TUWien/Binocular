'use strict';

const gql = require('graphql-sync');
const Timestamp = require('./Timestamp');

module.exports = new gql.GraphQLObjectType({
  name: 'comment',
  description: 'A github/gitlab comment',
  fields() {
    return {
      id: {
        type: gql.GraphQLString,
        description: 'id of the comment',
      },
      author: {
        type: require('./gitHubUser.js'),
        description: 'the github/gitlab author of this comment',
      },
      createdAt: {
        type: Timestamp,
        description: 'Creating date of comment',
      },
      updatedAt: {
        type: Timestamp,
        description: 'Update date of comment',
      },
      lastEditedAt: {
        type: Timestamp,
        description: 'Last edit date of comment',
      },
      path: {
        type: gql.GraphQLString,
        description: 'Path to file the comment is referencing',
      },
      bodyText: {
        type: gql.GraphQLString,
        description: 'Content of the comment',
      },
    };
  },
});
