'use strict';

const gql = require('graphql-sync');

module.exports = new gql.GraphQLObjectType({
  name: 'ReviewThread',
  description: 'A review thread',
  fields() {
    return {
      id: {
        type: gql.GraphQLString,
        description: 'id of the review thread',
      },
      isResolved: {
        type: gql.GraphQLBoolean,
        description: 'resolved state of the review thread',
      },
      resolvedBy: {
        type: require('./gitHubUser.js'),
        description: 'the github/gitlab user that marked this thread as resolved',
      },
      path: {
        type: gql.GraphQLString,
        description: 'the path to the file this thread is referencing',
      },
      comments: {
        type: new gql.GraphQLList(require('./comment.js')),
        description: 'the comments belonging to this review thread',
      },
    };
  },
});
