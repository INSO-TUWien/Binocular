'use strict';

const gql = require('graphql-sync');
const Timestamp = require('./Timestamp');

module.exports = new gql.GraphQLObjectType({
  name: 'mergeRequest',
  description: 'A mergeRequest (Gitlab Only Github MergeRequests are equivalent to Issues)',
  fields() {
    return {
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github author of this issue',
      },
      id: {
        type: gql.GraphQLString,
        description: 'id of the note',
      },
      status: {
        type: gql.GraphQLString,
        description: 'status of the note',
      },
      time_stats: {
        type: gql.GraphQLString,
        description: 'time_stats of the note',
      },
      created_at: {
        type: Timestamp,
        description: 'Creation date of the issue',
      },
    };
  },
});
