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
        description: 'The github/gitlab author of this mergeRequest',
      },
      id: {
        type: gql.GraphQLString,
        description: 'id of the mergeRequest',
      },
      iid: {
        type: gql.GraphQLString,
        description: 'iid of the mergeRequest',
      },
      title: {
        type: gql.GraphQLString,
        description: 'title of the mergeRequest',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'webUrl of the mergeRequest',
      },
      sourceBranch: {
        type: gql.GraphQLString,
        description: 'sourceBranch of the mergeRequest',
      },
      targetBranch: {
        type: gql.GraphQLString,
        description: 'targetBranch of the mergeRequest',
      },
      state: {
        type: gql.GraphQLString,
        description: 'state of the mergeRequest',
      },
      timeStats: {
        type: require('./timeStats.js'),
        description: 'time_stats of the mergeRequest',
      },
      createdAt: {
        type: Timestamp,
        description: 'Creation date of the mergeRequest',
      },
      notes: {
        type: new gql.GraphQLList(require('./gitlabNote.js')),
        description: 'Notes attached to the Merge Request',
      },
    };
  },
});
