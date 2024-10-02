'use strict';

const gql = require('graphql-sync');
const arangodb = require('@arangodb');
const Timestamp = require('./Timestamp');

module.exports = new gql.GraphQLObjectType({
  name: 'GitLabNote',
  description: 'A GitLabNote',
  fields() {
    return {
      author: {
        type: require('./gitHubUser.js'),
        description: 'The github author of this issue',
      },
      body: {
        type: gql.GraphQLString,
        description: 'body of the note',
      },
      created_at: {
        type: Timestamp,
        description: 'Creation date of the issue',
      },
    };
  },
});
