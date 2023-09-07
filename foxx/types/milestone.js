'use strict';

const gql = require('graphql-sync');
const Timestamp = require('./Timestamp');

module.exports = new gql.GraphQLObjectType({
  name: 'milestone',
  description: 'A milestone/sprint',
  fields() {
    return {
      id: {
        type: gql.GraphQLString,
        description: 'id of the milestone',
      },
      iid: {
        type: gql.GraphQLString,
        description: 'iid of the milestone',
      },
      title: {
        type: gql.GraphQLString,
        description: 'title of the milestone',
      },
      description: {
        type: gql.GraphQLString,
        description: 'description of the milestone',
      },
      state: {
        type: gql.GraphQLString,
        description: 'state of the milestone',
      },
      createdAt: {
        type: Timestamp,
        description: 'creation date of the milestone',
      },
      updatedAt: {
        type: Timestamp,
        description: 'last update date of the milestone',
      },
      dueDate: {
        type: Timestamp,
        description: 'due date of the milestone',
      },
      startDate: {
        type: Timestamp,
        description: 'start date of the milestone',
      },
      expired: {
        type: gql.GraphQLString,
        description: 'expired status of the milestone',
      },
      webUrl: {
        type: gql.GraphQLString,
        description: 'web url of the milestone',
      },
    };
  },
});
